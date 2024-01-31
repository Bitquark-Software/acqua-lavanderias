<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ProdPersonalReportController extends BaseReportController
{
    /*
        En esta Clase se crea el Reporte de Produccion por Empleado(usuarios)
    */

    public function produccionUsuarios($fecha_inicio, $fecha_fin, $usuario)
    {
        $resultados = Ticket::join('servicio_tickets', 'tickets.id', '=', 'servicio_tickets.id_ticket')
            ->join('prendas_tickets', 'tickets.id', '=', 'prendas_tickets.id_ticket')
            ->join('proceso_tickets', 'tickets.id', 'proceso_tickets.id_ticket')
            ->join('procesos', 'procesos.id', 'proceso_tickets.id_proceso')
            ->join('servicios', 'servicio_tickets.id_servicio', '=', 'servicios.id')
            ->join('catalogos', 'catalogos.id', '=', 'servicios.catalogo_id')
            ->where('proceso_tickets.user_id', $usuario)
            ->whereIn('procesos.nombre', ['CONTEO', 'LAVADO', 'SECADO'])
            ->whereBetween('tickets.created_at', [$fecha_inicio, $fecha_fin])
            ->select([
                'catalogos.name',
                'servicios.nombre_servicio',
                'procesos.nombre',
                'tickets.id as id_ticket',
                'proceso_tickets.timestamp_start',
                'proceso_tickets.timestamp_end',
                'prendas_tickets.total_inicial',
                DB::raw('SUM(servicio_tickets.kilos) as kilos'),
            ])
            ->groupBy(
                'catalogos.name',
                'servicios.nombre_servicio',
                'procesos.nombre',
                'tickets.id',
                'proceso_tickets.timestamp_start',
                'proceso_tickets.timestamp_end',
                'prendas_tickets.total_inicial'
            )
            ->orderBy('tickets.id')
            ->get()
            ->toArray();

        return $resultados;
    }

    /**
     * Este método procesa y organiza los resultados de una consulta.
     *
     * @param array $resulConsulta Un array que contiene los resultados de una consulta.
     * @param bool $tabla2 Un booleano que indica si se deben calcular los kilos por minuto.
     * @param bool $tabla3 Un booleano que indica si se deben calcular las piezas por minuto.
     *
     * @return array Retorna un array con los resultados ordenados.
     */
    function resultadosOrdKgOrdenados($resulConsulta, $tabla2 = false, $tabla3 = false)
    {
        if ($resulConsulta === null) {
            return response()->json([
                'mensaje' => 'Contenido de produccion por empleados no encontrado'
            ]);
        }

        $resultadosOrdenados = [];
        $ticketsProcesados = [];
        foreach ($resulConsulta as $resultado) {
            $nomCatalogo = $resultado['name'];
            $nomServicio = $resultado['nombre_servicio'];
            $nomProceso = $resultado['nombre'];
            $idTicket = $resultado['id_ticket'];
            $timestampStart = $resultado['timestamp_start'];
            $timestampEnd = $resultado['timestamp_end'];
            $kilos = $resultado['kilos'];
            $piezas = $resultado['total_inicial'];

            if ($timestampEnd === null) continue;

            // Si el ticket ya ha sido procesado para 'LAVADO' o 'SECADO', entonces saltamos este ciclo
            if (($nomProceso == 'LAVADO' || $nomProceso == 'SECADO') && isset($ticketsProcesados[$idTicket][$nomProceso])) continue;

            $diferenciaEnMinutos = $this->calcularDiferenciaEnMinutos($timestampStart, $timestampEnd);

            // Seccion que crea la estructura del array Ordenado
            $resultadosOrdenados[$nomCatalogo][$nomServicio][$nomProceso] = $resultadosOrdenados[$nomCatalogo][$nomServicio][$nomProceso] ?? [
                'kilos' => 0,
                'total_inicial' => 0,
                'totalMin' => $diferenciaEnMinutos
            ];

            if ($tabla2) {
                $resultadosOrdenados[$nomCatalogo][$nomServicio][$nomProceso]['kilos'] += $diferenciaEnMinutos !== 0 ? round($kilos / $diferenciaEnMinutos, 2) : 0;
                $resultadosOrdenados[$nomCatalogo][$nomServicio][$nomProceso]['totalMin'] += $diferenciaEnMinutos;
            } elseif ($tabla3) {
                $resultadosOrdenados[$nomCatalogo][$nomServicio][$nomProceso]['total_inicial'] += $diferenciaEnMinutos !== 0 ? round($piezas / $diferenciaEnMinutos, 2) : 0;
            } else {
                $resultadosOrdenados[$nomCatalogo][$nomServicio][$nomProceso]['kilos'] += $kilos;
                $resultadosOrdenados[$nomCatalogo][$nomServicio][$nomProceso]['total_inicial'] += $piezas;
            }

            if ($nomProceso === 'LAVADO' || $nomProceso === 'SECADO') {
                $ticketsProcesados[$idTicket][$nomProceso] = true;
            }
        }
        return $resultadosOrdenados;
    }

    public function repProdUsuarioPdf(Request $request)
    {
        $request->validate([
            'fecha_inicio' => ['date_format:Y-m-d H:i:s', 'nullable'],
            'fecha_fin' => ['date_format:Y-m-d H:i:s', 'nullable', 'after_or_equal:fecha_inicio'],
            'usuario' => ['required', 'exists:users,id']
        ]);

        $fecha = $this->verificacionFechas($request->fecha_inicio, $request->fecha_fin);

        try {
            $usuario = User::find($request->usuario);
        } catch (\Exception $e) {
            echo 'Error usuario no encontrado',  $e->getMessage(), "\n";
        }

        try {
            $personalResult = $this->produccionUsuarios($fecha['inicioFecha'], $fecha['finFecha'], $usuario->id);
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => $e->getMessage()
            ], 404);
        }

        try {
            $resulOrdenadosTrabajados = $this->resultadosOrdKgOrdenados($personalResult); // Tabla 1

            $resulOrdenadosTrabajados2 = $this->resultadosOrdKgOrdenados($personalResult, true); // Tabla 2

            $resulOrdenadosTrabajados3 = $this->resultadosOrdKgOrdenados($personalResult, false, true); // Tabla 3
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => $e->getMessage()
            ], 404);
        }

        $pdf = app('dompdf.wrapper');

        $html = $this->estilos;

        $html .= '<div class="watermark"> Acqua Lavanderias </div>';

        $html .= '<header>'; // Inicio de Encabezado
        $html .= "<h1 class='texto verdeBag'>REPORTE DE PRODUCCION(USUARIOS)</h1>";
        $html .= "<p class='alinear-derecha'>Periodo: " . $fecha['inicioFecha']->format('Y-m-d') . ' - ' . $fecha['finFecha']->format('Y-m-d') . '</p>';
        $html .= "<h3 class='texto'>Usuario: " . '<span class="verdeBag">' . $usuario->name . '</span>' . '</h3>';
        $html .= '</header>'; // Fin de Encabezado

        $html .= '<body>';

        // -*-*-*-*-*- SECCION DE TABLA 1 -*-*-*-*-*-

        $html .= "<h5 class='negrita texto'>PRODUCCION DEL EMPLEADO</h5>";

        $html .= '<table>';

        $html .= "<tr>";
        $html .= "<th>  </th>";
        $html .= "<th colspan='5' class='verdeBag bordeR'>KG TRABAJADOS</th>";
        $html .= "</tr>";

        $html .= "<tr>";
        $html .= "<th> </th>";
        $html .= "<th> </th>";
        $html .= "<th>CONTEO</th>";
        $html .= "<th>LAVADO</th>";
        $html .= "<th>SECADO</th>";
        $html .= "</tr>";

        $arrayNombres = ['LAVANDERIA', 'ROPA DE CAMA', 'TENIS', 'PLANCHADO'];

        foreach ($resulOrdenadosTrabajados as $catalogo => $valores) :
            $totalConteo = 0;
            $totalLavado = 0;
            $totalSecado = 0;
            if (in_array(strtoupper($catalogo), $arrayNombres)) {
                foreach ($valores as $valor => $val) :
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
                endforeach;
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

        // -*-*-*-*-*- SECCION DE TABLA 2 -*-*-*-*-*-

        $html .= "<h5 class='negrita texto'>MATRICES DE PRODUCCION POR CATEGORIA</h5>";

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

        $arrayNombres2 = ['LAVANDERIA'];

        foreach ($resulOrdenadosTrabajados2 as $catalogo => $valores) :
            $totalConteo2 = 0;
            $totalLavado2 = 0;
            $totalSecado2 = 0;
            if (in_array(strtoupper($catalogo), $arrayNombres2)) :
                foreach ($valores as $valor => $val) :
                    $totalConteo2 += $val['CONTEO']['kilos'] ?? 0;
                    $totalLavado2 += $val['LAVADO']['kilos'] ?? 0;
                    $totalSecado2 += $val['SECADO']['kilos'] ?? 0;
                    if (strtoupper($catalogo) === 'LAVANDERIA') :
                        $html .= "<tr>";
                        $html .= "<td> - " . $valor . "</td>";
                        $html .= "<td> </td>";
                        $html .= "<td>" . (array_key_exists('CONTEO', $val) ? $val['CONTEO']['kilos'] : 0) .  "</td>";
                        $html .= "<td>" . (array_key_exists('LAVADO', $val) ? $val['LAVADO']['kilos'] : 0) .  "</td>";
                        $html .= "<td>" . (array_key_exists('SECADO', $val) ? $val['SECADO']['kilos'] : 0) .  "</td>";
                        $html .= "</tr>";
                    endif;
                endforeach;
            endif;
            if (in_array(strtoupper($catalogo), $arrayNombres2)) :
                $html .= "<tr>";
                $html .= "<td class='alinear-izquierdda verdeBag'>" . $catalogo . "</td>";
                $html .= "<td> </td>";
                $html .= "<td class='bordestd'>" . $totalConteo2 . "</td>";
                $html .= "<td class='bordestd'>" . $totalLavado2 . "</td>";
                $html .= "<td class='bordestd'>" . $totalSecado2 . "</td>";
                $html .= "</tr>";
            endif;
        endforeach;

        $html .= '</table>';

        $html .= '<br>';
        $html .= '<br>';

        // -*-*-*-*-*- SECCION DE TABLA 3 -*-*-*-*-*-

        $numRegistros = 0;
        foreach ($resulOrdenadosTrabajados3 as $catalogo => $valores) :
            if (strtoupper($catalogo) === 'ROPA DE CAMA') :
                foreach ($valores as $valor => $val) :
                    $numRegistros += 1;
                endforeach;
            endif;
        endforeach;

        if ($numRegistros >= 6) :
            $html .= '<div class="page-break"></div>';
        endif;

        $html .= '<table>';

        $html .= "<tr>";
        $html .= "<th>  </th>";
        $html .= "<th colspan='5' class='verdeBag bordeR'>CADENCIA (PZAS/MIN)</th>";
        $html .= "</tr>";

        $html .= "<tr>";
        $html .= "<th> </th>";
        $html .= "<th> </th>";
        $html .= "<th>CONTEO</th>";
        $html .= "<th>LAVADO</th>";
        $html .= "<th>SECADO</th>";
        $html .= "</tr>";

        foreach ($resulOrdenadosTrabajados3 as $catalogo => $valores) :
            $totalConteo3 = 0;
            $totalLavado3 = 0;
            $totalSecado3 = 0;
            if (strtoupper($catalogo) === 'ROPA DE CAMA') :
                foreach ($valores as $valor => $val) :
                    $totalConteo3 += $val['CONTEO']['total_inicial'] ?? 0;
                    $totalLavado3 += $val['LAVADO']['total_inicial'] ?? 0;
                    $totalSecado3 += $val['SECADO']['total_inicial'] ?? 0;
                    $html .= "<tr>";
                    $html .= "<td> - " . $valor . "</td>";
                    $html .= "<td> </td>";
                    $html .= "<td>" . (array_key_exists('CONTEO', $val) ? $val['CONTEO']['total_inicial'] : 0) .  "</td>";
                    $html .= "<td>" . (array_key_exists('LAVADO', $val) ? $val['LAVADO']['total_inicial'] : 0) .  "</td>";
                    $html .= "<td>" . (array_key_exists('SECADO', $val) ? $val['SECADO']['total_inicial'] : 0) .  "</td>";
                    $html .= "</tr>";
                endforeach;
                $html .= "<tr>";
                $html .= "<td class='alinear-izquierdda verdeBag'>" . $catalogo . "</td>";
                $html .= "<td> </td>";
                $html .= "<td>" . $totalConteo3 . "</td>";
                $html .= "<td>" . $totalLavado3 .  "</td>";
                $html .= "<td>" . $totalSecado3 .  "</td>";
                $html .= "</tr>";
            endif;
        endforeach;

        $html .= '</table>';

        $html .= '</body>';

        $pdf->loadHTML($html);
        
        $ouput = $pdf->stream();
        $base64 = base64_encode($ouput);

        return response()->json($base64);
    }
}
