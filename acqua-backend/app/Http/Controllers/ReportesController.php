<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Catalogo;
use App\Models\Ticket;
use App\Models\Sucursal;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Cmixin\BusinessDay;
use Illuminate\Support\Facades\DB;

class ReportesController extends Controller
{
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
        $html = '
            <style>
                p {
                    text-align: center;
                    font-size: 13px;
                }
                table {
                    text-align:center;
                }
                table:nth-of-type(1) {
                    width: 100%;
                    border: 1px dashed black;
                    border-radius: 10px;
                    padding: 10px;
                }
                table:nth-of-type(2), table:nth-of-type(3) {
                    width: 60%;
                    border: 1px dashed black;
                    border-radius: 10px;
                    padding: 7px;
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

        $html .= '<div class="watermark"> Acqua Lavanderias </div>';

        $html .= '<header>'; // Inicio de Encabezado
        $html .= "<h1 class='texto verdeBag'>Reporte Detallado de Ventas</h1>";
        $html .= "<p class='alinear-derecha negrita'>Dias Festivos:" . $dias_festibos . '</p>';
        $html .= "<p class='alinear-derecha'>Periodo: " . $inicioFechaConsulta->format('Y-m-d') . ' - ' . $finFechaConsulta->format('Y-m-d') . '</p>';
        $html .= "<h3 class='texto'>Sucursal: " . '<span class="verdeBag">' . $sucursal->nombre . '</span>' . '</h3>';
        $html .= '</header>';// Fin de Encabezado

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
        $html .= "</body>";// Fin de Body

        $pdf->loadHTML($html);

        $ouput = $pdf->stream();
        $base64 = base64_encode($ouput);

        return response()->json($base64);
    }
}
