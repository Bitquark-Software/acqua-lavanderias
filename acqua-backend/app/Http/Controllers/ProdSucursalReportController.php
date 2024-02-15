<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Sucursal;
use Illuminate\Support\Facades\DB;

class ProdSucursalReportController extends BaseReportController
{
    /*
        En esta clase se crear el Reporte de Produccion por Sucursal
    */

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
            if (($nombreProceso === 'LAVADO' || $nombreProceso === 'SECADO') && isset($ticketsProcesados[$id_ticket][$nombreProceso])) continue;

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

            if ($nombreProceso === 'LAVADO' || $nombreProceso === 'SECADO') {
                $ticketsProcesados[$id_ticket][$nombreProceso] = true;
            }
        }
        return $resultadosOrdenados;
    }

    public function LavadorasTabla($fecha_inicio, $fecha_fin, $sucursal)
    {
        $resultado = Ticket::join('servicio_tickets', 'tickets.id', '=', 'servicio_tickets.id_ticket')
            ->join('prendas_tickets', 'tickets.id', '=', 'prendas_tickets.id_ticket')
            ->join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->join('lavadoras', 'lavadoras.id', '=', 'proceso_tickets.id_lavadora')
            ->where('lavadoras.id_sucursal', '=', $sucursal)
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

    public function SecadorasTabla($fecha_inicio, $fecha_fin, $sucursal)
    {
        $resultado = Ticket::join('servicio_tickets', 'tickets.id', '=', 'servicio_tickets.id_ticket')
            ->join('prendas_tickets', 'tickets.id', '=', 'prendas_tickets.id_ticket')
            ->join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->join('secadoras', 'secadoras.id', '=', 'proceso_tickets.id_secadora')
            ->where('secadoras.id_sucursal', '=', $sucursal)
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
            'fecha_fin' => ['date_format:Y-m-d H:i:s', 'nullable', 'after_or_equal:fecha_inicio']
        ]);

        $fecha = $this->verificacionFechas($request->fecha_inicio, $request->fecha_fin);

        try {
            $sucursales = Sucursal::get();
        } catch (\Exception $e) {
            echo 'Error sucursal no encontrada',  $e->getMessage(), "\n";
        }

        // * Seccion de Creacion de PDF
        $pdf = app('dompdf.wrapper');

        $html = $this->estilos; // * Aqui estan los estilos

        $html .= '<div class="watermark"> Acqua Lavanderias </div>';

        $html .= "<h1 class='texto verdeBag'>REPORTE DE PRODUCCIÓN (PROCESOS)</h1>";

        $html .= '<body>';

        foreach($sucursales as $sucursal)
        {
            try {
                // Cosulta Principal para las dos primeras Tablas
                $resServiciosKilos = $this->produccionGeneral($fecha['inicioFecha'], $fecha['finFecha'], $sucursal->id);
                // Ordenamiento de datos retornados de la consulta
                $resultadosOrdenados = $this->calcularResultadosOrdenados($resServiciosKilos); // Tabla 1
                $resultadosOrdenados2 = $this->calcularResultadosOrdenados($resServiciosKilos, true); // Tabla 2
    
                // Lavadpras
                $resultadoLavadoras = $this->LavadorasTabla($fecha['inicioFecha'], $fecha['finFecha'], $sucursal->id);
                $resOrdenadosLav = $this->resultadosOrdenadosLavSec($resultadoLavadoras);
    
                // Secadoras
                $resultadoSecadoras = $this->SecadorasTabla($fecha['inicioFecha'], $fecha['finFecha'], $sucursal->id);
                $resOrdenadosSec = $this->resultadosOrdenadosLavSec(null, $resultadoSecadoras);
            } catch (\Exception $e) {
                return response()->json([
                    'mensaje' => $e->getMessage()
                ], 404);
            }

            $html .= '<header>'; // Inicio de Encabezado
            $html .= "<p class='alinear-derecha'>Periodo: " . $fecha['inicioFecha']->format('Y-m-d') . ' - ' . $fecha['finFecha']->format('Y-m-d') . '</p>';
    
            $html .= "<h3 class='texto'>Sucursal: " . '<span class="verdeBag">' . $sucursal->nombre . '</span>' . '</h3>';
            $html .= '</header>'; // Fin de Encabezado

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
        }

        $html .= '</body>';

        $pdf->loadHTML($html);

        $ouput = $pdf->stream();
        $base64 = base64_encode($ouput);

        return response()->json($base64);
    }
}
