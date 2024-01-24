<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Ticket;
use Cmixin\BusinessDay;
use App\Models\Catalogo;
use App\Models\Sucursal;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportesController extends Controller
{
    private $estilos = '
    <style>
        p {
            text-align: center;
            font-size: 13px;
        }
        table {
            text-align:center;
            width: 100%;
            border: 1px dashed black;
            border-radius: 10px;
            padding: 10px;
        }
        th, td {
            padding: 5px;
            text-align: center;
            font-size: 12px;
        }
        .texto {
            text-align: center;
        }
        .negrita {
            font-weight: bold
        }
        .alinear-derecha {
            text-align: right;
        }
        .alinear-izquierdda {
            text-align: left;
        }
        .verdeBag {
            background-color : #008080;
            color : #ffffff;
        }
        .bordestd {
            border-bottom: 1px solid rgb(86, 197, 252);
        }
        .bordeds {
            border: 1px dashed black;
            border-radius: 2px;
        }
        .page-break {
            page-break-before: always;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            z-index: 1000;
            font-size: 90px;
            text-align: center;
        }
        header {
            position: fixed;
            top: 0cm;
            left: 0cm;
            right: 0cm;
            height: 2cm;
        }
        body {
            margin-top: 5cm; /* Ajusta este valor según la altura de tu encabezado */
        }
    </style>';

    /**
     * Método para obtener información de ventas por categorías.
     *
     * @param  string  $Finicio     Fecha de inicio del rango de tiempo.
     * @param  string  $Ffin        Fecha de fin del rango de tiempo.
     * @param  int     $idSucursal  ID de la sucursal.
     * @return \Illuminate\Support\Collection
     *
     * Este método realiza las siguientes operaciones:
     * 1. Une las tablas 'tickets', 'servicio_tickets', 'servicios' y 'catalogos' en base a sus relaciones.
     * 2. Filtra los tickets basándose en el ID de la sucursal y un rango de fechas.
     * 3. Selecciona el nombre del catálogo, el nombre del servicio, la suma total de los tickets y la suma de los kilos de los 'servicio_tickets'.
     * 4. Agrupa los resultados por el nombre del catálogo y el nombre del servicio.
     * 5. Devuelve los resultados como una colección.
     */
    public function InformVentCategorias($Finicio, $Ffin, $idSucursal)
    {
        $total = Ticket::join('servicio_tickets', 'tickets.id', '=', 'servicio_tickets.id_ticket')
            ->join('servicios', 'servicio_tickets.id_servicio', '=', 'servicios.id')
            ->join('catalogos', 'servicios.catalogo_id', '=', 'catalogos.id')
            ->where('tickets.id_sucursal', $idSucursal)
            ->whereBetween('tickets.created_at', [$Finicio, $Ffin])
            ->select([
                'catalogos.name as catalogo_name',
                'servicios.nombre_servicio',
                DB::raw('SUM(tickets.total) as total'),
                DB::raw('SUM(servicio_tickets.kilos) as kilos')
            ])
            ->groupBy('catalogos.name', 'servicios.nombre_servicio')
            ->get();

        return $total;
    }

    /**
     * Método para generar un reporte detallado en formato PDF.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * Este método realiza las siguientes operaciones:
     * 1. Valida los datos de entrada del request.
     * 2. Habilita los días festivos para Carbon.
     * 3. Calcula el número de días hábiles y festivos en el periodo.
     * 4. Obtiene los catálogos y servicios.
     * 5. Genera el PDF y lo convierte a base64.
     * 6. Devuelve el PDF en base64 como respuesta JSON.
     */
    public function repDetPdf(Request $request)
    {
        $request->validate([
            'fecha_inicio' => ['date_format:Y-m-d H:i:s', 'nullable'],
            'fecha_fin' => ['date_format:Y-m-d H:i:s', 'nullable', 'after_or_equal:fecha_inicio'],
            'sucursal' => ['required', 'exists:sucursales,id']
        ]);

        $inicioFechaConsulta = $request->fecha_inicio;
        $finFechaConsulta = $request->fecha_fin;

        if (empty($inicioFechaConsulta) && empty($finFechaConsulta)) {
            // Fecha Inicio y Final no Proporcinadas
            $inicioFechaConsulta = Carbon::now()->startOfDay();
            $finFechaConsulta = Carbon::now()->endOfDay();
        } else {
            /// Fechas Proporcinadas
            $inicioFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_inicio'))->startOfDay();
            $finFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_fin'))->endOfDay();
        }

        try {
            // Sucursal
            $sucursal = Sucursal::find($request->sucursal);
        } catch (\Exception $e) {
            echo 'Error sucursal no encontrada',  $e->getMessage(), "\n";
        }

        // * >>>> Dias Festivos <<<<<
        BusinessDay::enable('Carbon\Carbon', 'mx', [
            'new-year' => '01-01',
            'christmas' => '12-25',
        ]);

        // Crea un periodo de fechas desde fecha_inicio hasta fecha_fin
        $periodo = new CarbonPeriod($inicioFechaConsulta->format('Y-m-d'), $finFechaConsulta->format('Y-m-d'));

        // Calcula el número de días hábiles en el periodo
        $dias_habiles = 0;
        $dias_festibos = 0;
        foreach ($periodo as $fecha) {
            if ($fecha->isHoliday()) { // Verifica si los dias agregados anteriormente
                $dias_festibos++;
            } elseif (!$fecha->isWeekend()) {
                $dias_habiles++;
            }
        }

        // Ctalogos y Servicios
        try {
            $catalogos = Catalogo::with('servicios')->get()->toArray();
        } catch (\Exception $e) {
            echo 'Error al Mostrar los Catalogos y Servicios',  $e->getMessage(), "\n";
        }

        try {
            // Totales de Cada Catalogo y Servicios
            $Importes = $this->InformVentCategorias($request->fecha_inicio, $request->fecha_fin, $request->sucursal);
        } catch (\Exception $e) {
            echo 'Error al mostrar totales y kilogramos de servicios';
        }

        $pdf = app('dompdf.wrapper');

        $html = $this->estilos; // * Llamado de estilos

        $html .= '<div class="watermark"> Acqua Lavanderias </div>';

        $html .= '<header>'; // Inicio de Encabezado
        $html .= "<h1 class='texto verdeBag'>Reporte Detallado de Ventas</h1>";
        $html .= "<p class='alinear-derecha negrita'>Dias Festivos:" . $dias_festibos . '</p>';
        $html .= "<p class='alinear-derecha'>Periodo: " . $inicioFechaConsulta->format('Y-m-d') . ' - ' . $finFechaConsulta->format('Y-m-d') . '</p>';
        $html .= "<h3 class='texto'>Sucursal: " . '<span class="verdeBag">' . $sucursal->nombre . '</span>' . '</h3>';
        $html .= '</header>'; // Fin de Encabezado

        $html .= "<body>"; // Inicio de Body
        $html .= "<table>";

        $html .= "<tr>";
        $html .= "<th>  </th>";
        $html .= "<th>Unicada</th>";
        $html .= "<th>Cantidad</th>";
        $html .= "<th>Importe Total</th>";
        $html .= "</tr>";

        foreach ($catalogos as $catalogo) :
            $totalKilos = 0;
            $totalImporte = 0;
            foreach ($Importes as $importe) :
                if ($importe->catalogo_name == $catalogo['name']) {
                    foreach ($catalogo['servicios'] as $servicio) :
                        if ($importe->nombre_servicio == $servicio['nombre_servicio']) {
                            $totalKilos += $importe->kilos;
                            $totalImporte += $importe->total;
                            $html .= "<tr>";
                            $html .= "<td> - " . $servicio['nombre_servicio'] . "</td>";
                            $html .= "<td>kg</td>";
                            $html .= "<td>$importe->kilos</td>";
                            $html .= "<td>$importe->total</td>";
                            $html .= "</tr>";
                        }
                    endforeach;
                }
            endforeach;

            $html .= "<tr>";
            $html .= "<td class='alinear-izquierdda verdeBag'>" . $catalogo['name'] . "</td>";
            $html .= "<td></td>";
            $html .= "<td class='bordestd'>" . ($totalKilos ?  $totalKilos : 'SinDatos') . "</td>";
            $html .= "<td class='bordestd'>" . ($totalImporte ? $totalImporte : 'SinDatos') . "</td>";
            $html .= "</tr>";
        endforeach;

        $html .= "</table>";
        $html .= "</body>"; // Fin de Body

        $pdf->loadHTML($html);

        $ouput = $pdf->stream();
        $base64 = base64_encode($ouput);

        return response()->json($base64);
    }

    public function produccionGeneral($fecha_inicio, $fecha_fin, $id_sucursal)
    {
        $resultados = Ticket::join('servicio_tickets', 'tickets.id', '=', 'servicio_tickets.id_ticket')
            ->join('proceso_tickets', 'tickets.id', 'proceso_tickets.id_ticket')
            ->join('procesos', 'procesos.id', 'proceso_tickets.id_proceso')
            ->join('servicios', 'servicio_tickets.id_servicio', '=', 'servicios.id')
            ->join('catalogos', 'catalogos.id', '=', 'servicios.catalogo_id')
            ->where('tickets.id_sucursal', $id_sucursal)
            ->whereIn('procesos.nombre', ['CONTEO', 'LAVADO', 'SECADO'])
            ->whereBetween('tickets.created_at', [$fecha_inicio, $fecha_fin])
            ->select([
                'catalogos.name',
                'servicios.nombre_servicio',
                'procesos.nombre',
                'tickets.id as id_ticket',
                'proceso_tickets.timestamp_start',
                'proceso_tickets.timestamp_end',
                DB::raw('SUM(servicio_tickets.kilos) as kilos')
            ])
            ->groupBy(
                'catalogos.name',
                'servicios.nombre_servicio',
                'procesos.nombre',
                'tickets.id',
                'proceso_tickets.timestamp_start',
                'proceso_tickets.timestamp_end'
            )
            ->orderBy('tickets.id')
            ->get()
            ->toArray();

        return $resultados;
    }

    /**
     * Este método calcula los resultados ordenados de los servicios y kilos.
     * Tablas: 
     * - Produccion General
     * - Matriz de Produccion por Proceso
     * @param array $resServiciosKilos Un array que contiene los servicios y kilos.
     * @param bool $tabla2 Un booleano opcional que determina si se debe calcular la tabla 2.
     *
     * @return array Retorna un array con los resultados ordenados.
     */
    function calcularResultadosOrdenados($resServiciosKilos, $tabla2 = false)
    {
        $resultadosOrdenados = [];
        $ticketsProcesados = [];
        foreach ($resServiciosKilos as $resultado) {
            $nombreCatalogo = $resultado['name'];
            $nombreServicio = $resultado['nombre_servicio'];
            $nombreProceso = $resultado['nombre'];
            $kilos = $resultado['kilos'];
            $timestampStart = $resultado['timestamp_start'];
            $timestampEnd = $resultado['timestamp_end'];
            $id_ticket = $resultado['id_ticket'];

            // Evita que los registros que no se hallan concluido ocasionen errores
            if ($timestampEnd === null) continue;

            // Si el ticket ya ha sido procesado para 'LAVADO' o 'SECADO', entonces saltamos este ciclo
            if (($nombreProceso == 'LAVADO' || $nombreProceso == 'SECADO') && isset($ticketsProcesados[$id_ticket][$nombreProceso])) continue;

            $diferenciaEnMinutos = $this->calcularDiferenciaEnMinutos($timestampStart, $timestampEnd);

            // Seccion que crea la estructura del array Ordenado
            if (!isset($resultadosOrdenados[$nombreCatalogo])) {
                $resultadosOrdenados[$nombreCatalogo] = [];
            }

            if (!isset($resultadosOrdenados[$nombreCatalogo][$nombreServicio])) {
                $resultadosOrdenados[$nombreCatalogo][$nombreServicio] = [];
            }

            if (!isset($resultadosOrdenados[$nombreCatalogo][$nombreServicio][$nombreProceso])) {
                $resultadosOrdenados[$nombreCatalogo][$nombreServicio][$nombreProceso] = [
                    'kilos' => 0,
                    'totalMin' => $diferenciaEnMinutos
                ];
            }

            if ($tabla2) {
                if ($diferenciaEnMinutos !== 0) {
                    $resultadosOrdenados[$nombreCatalogo][$nombreServicio][$nombreProceso]['kilos'] += round($kilos / $diferenciaEnMinutos, 2);
                    $resultadosOrdenados[$nombreCatalogo][$nombreServicio][$nombreProceso]['totalMin'] += $diferenciaEnMinutos;
                } else {
                    $resultadosOrdenados[$nombreCatalogo][$nombreServicio][$nombreProceso]['kilos'] = 0;
                }
            } else {
                $resultadosOrdenados[$nombreCatalogo][$nombreServicio][$nombreProceso]['kilos'] += $kilos;
            }

            if ($nombreProceso == 'LAVADO' || $nombreProceso == 'SECADO') {
                $ticketsProcesados[$id_ticket][$nombreProceso] = true;
            }
        }
        // dd($ticketsProcesados);
        return $resultadosOrdenados;
    }

    /**
     * Este método calcula la diferencia en minutos entre dos timestamps.
     *
     * @param string $timestampStart Un string que representa el timestamp de inicio en el formato 'Y-m-d H:i:s'.
     * @param string $timestampEnd Un string que representa el timestamp de fin en el formato 'Y-m-d H:i:s'.
     *
     * @return int Retorna la diferencia en minutos entre los dos timestamps.
     */
    function calcularDiferenciaEnMinutos($timestampStart, $timestampEnd)
    {
        $start = Carbon::createFromFormat('Y-m-d H:i:s', $timestampStart);
        $end = Carbon::createFromFormat('Y-m-d H:i:s', $timestampEnd);
        return $end->diffInMinutes($start);
    }

    /**
     * Este método convierte los minutos en un formato de tiempo más legible.
     *
     * @param int $minutos Un entero que representa los minutos a convertir.
     *
     * @return string Retorna una cadena que representa el tiempo en un formato de 'Días, Horas, Minutos'.
     */
    function convertirTiempo($minutos)
    {
        // Calcula el número de días, horas y minutos
        $dias = floor($minutos / (60 * 24));
        $horas = floor(($minutos - $dias * 60 * 24) / 60);
        $min = $minutos - ($dias * 60 * 24) - ($horas * 60);

        $tiempo = ""; // Inicializa el string

        // Concatena los días, horas y minutos a la cadena de tiempo
        if ($dias > 0) {
            $tiempo .= "$dias Día(s)";
        }
        if ($horas > 0) {
            $tiempo .= "$horas Hora(s) ";
        }
        if ($min > 0) {
            $tiempo .= "$min Minuto(s)";
        }
        return $tiempo;
    }

    public function LavadorasTabla($fecha_inicio, $fecha_fin)
    {
        $resultado = Ticket::join('servicio_tickets', 'tickets.id', '=', 'servicio_tickets.id_ticket')
            ->join('prendas_tickets', 'tickets.id', '=', 'prendas_tickets.id_ticket')
            ->join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->join('lavadoras', 'lavadoras.id', '=', 'proceso_tickets.id_lavadora')
            ->whereBetween('tickets.created_at', [$fecha_inicio, $fecha_fin])
            ->select([
                'lavadoras.nombre',
                'tickets.id as id_ticket',
                'prendas_tickets.total_inicial',
                'proceso_tickets.timestamp_start',
                'proceso_tickets.timestamp_end',
                'proceso_tickets.id_proceso',
                DB::raw('SUM(servicio_tickets.kilos) as kilos')
            ])
            ->groupBy(
                'lavadoras.nombre',
                'prendas_tickets.total_inicial',
                'proceso_tickets.timestamp_start',
                'proceso_tickets.timestamp_end',
                'proceso_tickets.id_proceso',
                'tickets.id'
            )
            ->orderBy('lavadoras.nombre')
            ->get()
            ->toArray();

        return $resultado;
    }

    public function SecadorasTabla($fecha_inicio, $fecha_fin)
    {
        $resultado = Ticket::join('servicio_tickets', 'tickets.id', '=', 'servicio_tickets.id_ticket')
            ->join('prendas_tickets', 'tickets.id', '=', 'prendas_tickets.id_ticket')
            ->join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->join('secadoras', 'secadoras.id', '=', 'proceso_tickets.id_secadora')
            ->whereBetween('tickets.created_at', [$fecha_inicio, $fecha_fin])
            ->select([
                'secadoras.nombre',
                'tickets.id as id_ticket',
                'prendas_tickets.total_inicial',
                'proceso_tickets.timestamp_start',
                'proceso_tickets.timestamp_end',
                'proceso_tickets.id_proceso',
                DB::raw('SUM(servicio_tickets.kilos) as kilos')
            ])
            ->groupBy(
                'secadoras.nombre',
                'prendas_tickets.total_inicial',
                'proceso_tickets.timestamp_start',
                'proceso_tickets.timestamp_end',
                'proceso_tickets.id_proceso',
                'tickets.id'
            )
            ->orderBy('secadoras.nombre')
            ->get()
            ->toArray();

        return $resultado;
    }

    /**
     * Este método calcula los resultados ordenados para las lavadoras y secadoras.
     *  Tblas:  Lavadoras y Secadoras
     * 
     * @param array|null $resLav Un array opcional que contiene los resultados de las lavadoras.
     * @param array|null $resSec Un array opcional que contiene los resultados de las secadoras.
     *
     * @return array|JsonResponse Retorna un array con los resultados ordenados. Si tanto $resLav como $resSec son nulos, retorna una respuesta JSON con un mensaje de error.
     */
    function resultadosOrdenadosLavSec($resLav = null, $resSec = null)
    {
        if ($resLav === null && $resSec === null) {
            return response()->json([
                'mensaje' => "Contenido de lavadoras y secadoras nulos"
            ], 404);
        }

        $resultadosOrdenados = [];
        $ticketsId = []; // aqui voy a ver que ticket se repite o ya existe
        // Itera sobre cada resultado en $resLav o $resSec
        foreach ($resLav ?? $resSec as $resultado) {
            $nombreLavadora = $resultado['nombre'];
            $pzasTotal = $resultado['total_inicial'];
            $timestampStart = $resultado['timestamp_start'];
            $timestampEnd = $resultado['timestamp_end'];
            $kilos = $resultado['kilos'];
            $id_ticket = $resultado['id_ticket'];

            if ($timestampEnd === null) continue;

            if (in_array($id_ticket, $ticketsId)) continue;

            $ticketsId[] = $id_ticket;

            $diferenciaEnMinutos = $this->calcularDiferenciaEnMinutos($timestampStart, $timestampEnd);

            if (!isset($resultadosOrdenados[$nombreLavadora])) {
                $resultadosOrdenados[$nombreLavadora] = [
                    'kilos' => 0,
                    'pzasTotal' => 0,
                    'tiempoTrabajado' => $diferenciaEnMinutos,
                    'vecesUtilizado' => 0,
                ];
            }

            // Suma los kilos, piezas totales, tiempo trabajado y veces utilizado a los resultados ordenados
            $resultadosOrdenados[$nombreLavadora]['kilos'] += $kilos;
            $resultadosOrdenados[$nombreLavadora]['pzasTotal'] += $pzasTotal;
            $resultadosOrdenados[$nombreLavadora]['tiempoTrabajado'] += $diferenciaEnMinutos;
            $resultadosOrdenados[$nombreLavadora]['vecesUtilizado'] += 1;
        }
        return $resultadosOrdenados;
    }

    public function repProdPdf(Request $request)
    {
        $request->validate([
            'fecha_inicio' => ['date_format:Y-m-d H:i:s', 'nullable'],
            'fecha_fin' => ['date_format:Y-m-d H:i:s', 'nullable', 'after_or_equal:fecha_inicio'],
            'sucursal' => ['required', 'exists:sucursales,id']
        ]);

        $inicioFechaConsulta = $request->fecha_inicio;
        $finFechaConsulta = $request->fecha_fin;

        if (empty($inicioFechaConsulta) && empty($finFechaConsulta)) {
            // Fecha Inicio y Final no Proporcinadas
            $inicioFechaConsulta = Carbon::now()->startOfDay();
            $finFechaConsulta = Carbon::now()->endOfDay();
        } else {
            /// Fechas Proporcinadas
            $inicioFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_inicio'))->startOfDay();
            $finFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_fin'))->endOfDay();
        }

        try {
            $sucursal = Sucursal::find($request->sucursal);
        } catch (\Exception $e) {
            echo 'Error sucursal no encontrada',  $e->getMessage(), "\n";
        }

        try {
            // Cosulta Principal para las dos primeras Tablas
            $resServiciosKilos = $this->produccionGeneral($inicioFechaConsulta, $finFechaConsulta, $request->sucursal);
            // Ordenamiento de datos retornados de la consulta
            $resultadosOrdenados = $this->calcularResultadosOrdenados($resServiciosKilos); // Tabla 1
            $resultadosOrdenados2 = $this->calcularResultadosOrdenados($resServiciosKilos, true); // Tabla 2

            // Lavadpras
            $resultadoLavadoras = $this->LavadorasTabla($inicioFechaConsulta, $finFechaConsulta);
            $resOrdenadosLav = $this->resultadosOrdenadosLavSec($resultadoLavadoras);

            // Secadoras
            $resultadoSecadoras = $this->SecadorasTabla($inicioFechaConsulta, $finFechaConsulta);
            $resOrdenadosSec = $this->resultadosOrdenadosLavSec(null, $resultadoSecadoras);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => $e->getMessage()
            ], 404);
        }

        // * Seccion de Creacion de PDF
        $pdf = app('dompdf.wrapper');

        $html = $this->estilos; // * Aqui estan los estilos

        $html .= '<div class="watermark"> Acqua Lavanderias </div>';

        $html .= '<header>'; // Inicio de Encabezado
        $html .= "<h1 class='texto verdeBag'>REPORTE DE PRODUCCIÓN (PROCESOS)</h1>";
        $html .= "<p class='alinear-derecha negrita'>Dias Festivos:" . 'CONSULTA' . '</p>';
        $html .= "<p class='alinear-derecha'>Periodo: " . $inicioFechaConsulta->format('Y-m-d') . ' - ' . $finFechaConsulta->format('Y-m-d') . '</p>';
        $html .= "<h3 class='texto'>Sucursal: " . '<span class="verdeBag">' . $sucursal->nombre . '</span>' . '</h3>';
        $html .= '</header>'; // Fin de Encabezado

        $html .= '<body>';

        // -*-*-*-*-*-*-*-* SECCION 1 -*-*-*-*-*-*-*-*

        $html .= "<h5 class='negrita texto'>PRODUCCION GENERAL</h5>";

        $html .= '<table>';
        $html .= "<tr>";
        $html .= "<th>  </th>";
        $html .= "<th colspan='5' class='verdeBag bordeR'>KG/PZA TRABAJADOS</th>";
        $html .= "</tr>";

        $html .= "<tr>";
        $html .= "<th> </th>";
        $html .= "<th> </th>";
        $html .= "<th>CONTEO</th>";
        $html .= "<th>LAVADO</th>";
        $html .= "<th>SECADO</th>";
        $html .= "</tr>";

        $arrayNombres = ['LAVANDERIA', 'ROPA DE CAMA', 'TENIS', 'PLANCHADO'];

        foreach ($resultadosOrdenados as $catalogo => $valores) :
            $totalConteo = 0;
            $totalLavado = 0;
            $totalSecado = 0;
            if (in_array(strtoupper($catalogo), $arrayNombres)) {
                foreach ($valores as $valor => $val) {
                    $totalConteo += $val['CONTEO']['kilos'] ?? 0;
                    $totalLavado += $val['LAVADO']['kilos'] ?? 0;
                    $totalSecado += $val['SECADO']['kilos'] ?? 0;
                    if (strtoupper($catalogo) === 'LAVANDERIA') {
                        $html .= "<tr>";
                        $html .= "<td> - " . $valor . "</td>";
                        $html .= "<td> </td>";
                        $html .= "<td>" . (array_key_exists('CONTEO', $val) ? $val['CONTEO']['kilos'] : 0) .  "</td>";
                        $html .= "<td>" . (array_key_exists('LAVADO', $val) ? $val['LAVADO']['kilos'] : 0) .  "</td>";
                        $html .= "<td>" . (array_key_exists('SECADO', $val) ? $val['SECADO']['kilos'] : 0) .  "</td>";
                        $html .= "</tr>";
                    }
                }
                $html .= "<tr>";
                $html .= "<td class='alinear-izquierdda verdeBag'>" . $catalogo . "</td>";
                $html .= "<td> </td>";
                $html .= "<td class='bordestd'>" . $totalConteo . "</td>";
                $html .= "<td class='bordestd'>" . $totalLavado . "</td>";
                $html .= "<td class='bordestd'>" . $totalSecado . "</td>";
                $html .= "</tr>";
            }
        endforeach;

        $html .= '</table>';

        // -*-*-*-*-*-*-*-* SECCION 2 -*-*-*-*-*-*-*-*

        $html .= "<h5 class='negrita texto'>MATRIZ DE PRODUCCIÓN POR PROCESO</h5>";

        $html .= '<table>';
        $html .= "<tr>";
        $html .= "<th>  </th>";
        $html .= "<th colspan='5' class='verdeBag bordeR'>CADENCIA (KG/MIN)</th>";
        $html .= "</tr>";

        $html .= "<tr>";
        $html .= "<th> </th>";
        $html .= "<th> </th>";
        $html .= "<th>CONTEO</th>";
        $html .= "<th>LAVADO</th>";
        $html .= "<th>SECADO</th>";
        $html .= "</tr>";

        $arrayNombres2 = ['LAVANDERIA', 'ROPA DE CAMA'];

        foreach ($resultadosOrdenados2 as $catalogo => $valores) {
            $totalConteo2 = 0;
            $totalLavado2 = 0;
            $totalSecado2 = 0;
            if (in_array(strtoupper($catalogo), $arrayNombres2)) {
                foreach ($valores as $valor => $val) {
                    $totalConteo2 += $val['CONTEO']['kilos'] ?? 0;
                    $totalLavado2 += $val['LAVADO']['kilos'] ?? 0;
                    $totalSecado2 += $val['SECADO']['kilos'] ?? 0;
                    if (strtoupper($catalogo) === 'LAVANDERIA') {
                        $html .= "<tr>";
                        $html .= "<td> - " . $valor . "</td>";
                        $html .= "<td> </td>";
                        $html .= "<td>" . (array_key_exists('CONTEO', $val) ? $val['CONTEO']['kilos'] : 0) .  "</td>";
                        $html .= "<td>" . (array_key_exists('LAVADO', $val) ? $val['LAVADO']['kilos'] : 0) .  "</td>";
                        $html .= "<td>" . (array_key_exists('SECADO', $val) ? $val['SECADO']['kilos'] : 0) .  "</td>";
                        $html .= "</tr>";
                    }
                }
                $html .= "<tr>";
                $html .= "<td class='alinear-izquierdda verdeBag'>" . $catalogo . "</td>";
                $html .= "<td> </td>";
                $html .= "<td class='bordestd'>" . $totalConteo2 . "</td>";
                $html .= "<td class='bordestd'>" . $totalLavado2 . "</td>";
                $html .= "<td class='bordestd'>" . $totalSecado2 . "</td>";
                $html .= "</tr>";
            }
        }

        $html .= '</table>';
        $html .= '<div class="page-break"></div>';

        // -*-*-*-*-*-*-*-* SECCION 3 Tablas Lavadoras y Secadoras -*-*-*-*-*-*-*-*

        $html .= "<h5 class='negrita texto'>MATRICES DE PRODUCCIÓN POR EQUIPO</h5>";

        $html .= '<table>';

        $html .= "<tr>";
        $html .= "<th>Lavadoras</th>";
        $html .= "<th>Kg Lav</th>";
        $html .= "<th>Pzas Lav</th>";
        $html .= "<th>Tiempo Act. Lav</th>";
        $html .= "<th>Tiempo Act. Pza</th>";
        $html .= "<th>Cadencia Kg/Min</th>";
        $html .= "<th>Cadencia Piz/Min</th>";
        $html .= "</tr>";

        foreach ($resOrdenadosLav as $lavadora => $val) {
            $kgEntreMin1 = $val['tiempoTrabajado'] !== 0 ? round($val['kilos'] / $val['tiempoTrabajado'], 2) : 0;
            $pzEntreMin1 = $val['pzasTotal'] !== 0 ? round($val['kilos'] / $val['pzasTotal'], 2) : 0;
            $tiempoTranajado1 = $this->convertirTiempo($val['tiempoTrabajado']) ? $this->convertirTiempo($val['tiempoTrabajado']) : '0 Minuto(s)';

            $html .= "<tr>";
            $html .= "<td>" . $lavadora . "</td>";
            $html .= "<td>" . $val['kilos'] . " kg</td>";
            $html .= "<td>" . $val['pzasTotal'] . " pz</td>";
            $html .= "<td>" . $tiempoTranajado1  . " Min </td>";
            $html .= "<td>" . $val['vecesUtilizado'] . "</td>";
            $html .= "<td>" . $kgEntreMin1 . "</td>";
            $html .= "<td>" . $pzEntreMin1 . "</td>";
            $html .= "</tr>";
        }

        $html .= '</table>';

        $html .= '<br>';

        $html .= '<table>';

        $html .= "<tr>";
        $html .= "<th>Secadoras</th>";
        $html .= "<th>Kg Sec</th>";
        $html .= "<th>Pzas Sec</th>";
        $html .= "<th>Tiempo Act. Sec</th>";
        $html .= "<th>Tiempo Act. Pza</th>";
        $html .= "<th>Cadencia Kg/Min</th>";
        $html .= "<th>Cadencia Piz/Min</th>";
        $html .= "</tr>";

        foreach ($resOrdenadosSec as $secadora => $val) {
            $kgEntreMin2 = $val['tiempoTrabajado'] !== 0 ? round($val['kilos'] / $val['tiempoTrabajado'], 2) : 0;
            $pzEntreMin2 = $val['pzasTotal'] !== 0 ? round($val['kilos'] / $val['pzasTotal'], 2) : 0;
            $tiempoTranajado2 = $this->convertirTiempo($val['tiempoTrabajado']) ? $this->convertirTiempo($val['tiempoTrabajado']) : '0 Minuto(s)';

            $html .= "<tr>";
            $html .= "<td>" . $secadora . "</td>";
            $html .= "<td>" . $val['kilos'] . " kg</td>";
            $html .= "<td>" . $val['pzasTotal'] . " pz</td>";
            $html .= "<td>" . $tiempoTranajado2 . "</td>";
            $html .= "<td>" . $val['vecesUtilizado'] . "</td>";
            $html .= "<td>" . $kgEntreMin2 . "</td>";
            $html .= "<td>" . $pzEntreMin2 . "</td>";
            $html .= "</tr>";
        }

        $html .= '</table>';

        $html .= '</body>';

        $pdf->loadHTML($html);

        $ouput = $pdf->stream();
        $base64 = base64_encode($ouput);

        return response()->json($base64);
    }
}
