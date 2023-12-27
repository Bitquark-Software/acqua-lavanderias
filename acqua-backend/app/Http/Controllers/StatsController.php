<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Ticket;
use App\Models\AnticipoTicket;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Cmixin\BusinessDay;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;

class StatsController extends Controller
{
    /**
     * Genera un informe de ventas en formato JSON.
     *
     * Esta función recibe una solicitud con las fechas de inicio y fin (opcional) y genera un informe de ventas.
     * El informe incluye el total de ingresos, el monto cobrado y el monto por cobrar.
     * Si no se proporcionan las fechas de inicio y fin, la función utilizará la fecha actual como inicio y fin.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception Si las fechas proporcionadas no son válidas.
    */
    public function generateReport(Request $request): JsonResponse
    {

        $request->validate([
            'fecha_inicio' => ['date_format:Y-m-d H:i:s', 'nullable'],
            'fecha_fin' => ['date_format:Y-m-d H:i:s', 'nullable', 'after_or_equal:fecha_inicio']
        ]);

        $inicioFechaConsulta = $request->fecha_inicio;
        $finFechaConsulta = $request->fecha_fin;

        try {
            if (empty($inicioFechaConsulta) && empty($finFechaConsulta)) {
                // Fecha Inicio y Final no Proporcinadas
                $inicioFechaConsulta = Carbon::now()->startOfDay();
                $finFechaConsulta = Carbon::now()->endOfDay();
            } else {
                /// Fechas Proporcinadas
                $inicioFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_inicio'))->startOfDay();
                $finFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_fin'))->endOfDay();
            }

            // * Consulta para metodo de pago "Contado" Pagado
            $montoTicketsPagadosAContado = Ticket::where('tipo_credito', 'CONTADO')
                ->where('vencido', false)
                ->whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('total');

            // * Total Ingresos suma de todos los Tickets
            $montoTicketsTotal = Ticket::where('vencido', false)
                ->whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('total');

            // * Consulta para metodo de pago "Credito" Pagado
            $montoTicketsACreditoPagado = Ticket::where('tipo_credito', 'CREDITO')
                ->where('vencido', false)
                ->whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo');

            $totalIngresos = (float) round($montoTicketsTotal, 2);
            $montoCobrado = (float) round($montoTicketsPagadosAContado + $montoTicketsACreditoPagado, 2);
            $montoPorCobrar = (float) round($montoTicketsTotal - $montoCobrado, 2);

            return response()->json([
                'totalIngresos' => $totalIngresos,
                'montoCobrado' => $montoCobrado,
                'montoPorCobrar' => $montoPorCobrar
            ], 200);
        } catch (\Exception $e) {
            // Fecha no valida
            return response()->json(
                [
                    'mensaje' => $e->getMessage()
                ],
                500
            );
        }
    }

    /**
     * Genera estadísticas de seguimiento para un ticket específico.
     *
     * Esta función recibe un id de ticket y genera estadísticas de seguimiento para cada proceso asociado con ese ticket.
     * Los procesos incluyen: Conteo, Lavado, Secado, Reconteo, Planchado y Entrega.
     * Para cada proceso, se calcula la diferencia de tiempo entre el inicio y el fin del proceso.
     * Si un proceso no se ha realizado para el ticket, se devuelve null para ese proceso.
     *
     * @param  int  $id_ticket
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception Si el ticket no se encuentra o si hay un error al calcular las diferencias de tiempo.
    */

    public function statsTracks($id_ticket)
    {

        $ticket = Ticket::find($id_ticket);

        // Desencriptado de Numero de referencia, pero solo mostrando los tres ultimos caracteres
        if (!empty($ticket->numero_referencia)) {
            $ticket->numero_referencia = Crypt::decrypt($ticket->numero_referencia);

            // Esto sirve para mostrar solo los ultimos tres digitos de numero_referencia
            $longitud = strlen($ticket->numero_referencia);
            if ($longitud >= 3) {
                $ultimosTresCaracteres = substr($ticket->numero_referencia, -3);
                $ticket->numero_referencia = str_repeat('*', $longitud - 3) . $ultimosTresCaracteres;
            }
        } else {
            $ticket->numero_referencia;
        }

        // * Query de Proceso Conteo
        $conteo = Ticket::join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->join('procesos', 'proceso_tickets.id_proceso', '=', 'procesos.id')
            ->join('users', 'users.id', '=', 'proceso_tickets.user_id')
            ->select('users.name', 'proceso_tickets.timestamp_start', 'proceso_tickets.timestamp_end')
            ->where('tickets.id', $id_ticket)
            ->where('procesos.nombre', 'CONTEO')
            ->get();

        // * Logica de Proceso CONTEO
        $resultConteo = $conteo->isEmpty()
            ? null
            :  $conteo->map(function ($procesoTicket) {
                $timestampStart = Carbon::parse($procesoTicket->timestamp_start);
                $timestampEnd = Carbon::parse($procesoTicket->timestamp_end);

                $diff = $timestampStart->diff($timestampEnd);

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $diff->h,
                    'diferencia_en_minutos' => $diff->i,
                    'diferencia_en_segundos' => $diff->s,
                ];
            });

        // * Query de Proceso Lavado
        $lavado = Ticket::join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->join('procesos', 'proceso_tickets.id_proceso', '=', 'procesos.id')
            ->join('users', 'users.id', '=', 'proceso_tickets.user_id')
            ->select('users.name', 'proceso_tickets.timestamp_start', 'proceso_tickets.timestamp_end')
            ->where('tickets.id', $id_ticket)
            ->where('procesos.nombre', 'LAVADO')
            ->get();

        $resultLavado = $lavado->isEmpty()
            ? null
            :  $lavado->map(function ($procesoTicket) {
                $timestampStart = Carbon::parse($procesoTicket->timestamp_start);
                $timestampEnd = Carbon::parse($procesoTicket->timestamp_end);

                $diff = $timestampStart->diff($timestampEnd);

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $diff->h,
                    'diferencia_en_minutos' => $diff->i,
                    'diferencia_en_segundos' => $diff->s,
                ];
            });

        // * Query de Proceso Reconteo
        $reconteo = Ticket::join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->join('procesos', 'proceso_tickets.id_proceso', '=', 'procesos.id')
            ->join('users', 'users.id', '=', 'proceso_tickets.user_id')
            ->select('users.name', 'proceso_tickets.timestamp_start', 'proceso_tickets.timestamp_end')
            ->where('tickets.id', $id_ticket)
            ->where('procesos.nombre', 'RECONTEO')
            ->get();

        // * Logica de Proceso Reconteo
        $resultReconteo = $reconteo->isEmpty()
            ? null
            :  $reconteo->map(function ($procesoTicket) {
                $timestampStart = Carbon::parse($procesoTicket->timestamp_start);
                $timestampEnd = Carbon::parse($procesoTicket->timestamp_end);

                $diff = $timestampStart->diff($timestampEnd);

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $diff->h,
                    'diferencia_en_minutos' => $diff->i,
                    'diferencia_en_segundos' => $diff->s,
                ];
            });

        // * Query de Proceso Planchado
        $planchado = Ticket::join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->join('procesos', 'proceso_tickets.id_proceso', '=', 'procesos.id')
            ->join('users', 'users.id', '=', 'proceso_tickets.user_id')
            ->select('users.name', 'proceso_tickets.timestamp_start', 'proceso_tickets.timestamp_end')
            ->where('tickets.id', $id_ticket)
            ->where('procesos.nombre', 'PLANCHADO')
            ->get();

        // * Logica de Proceso Planchado
        $resultPlanchado = $planchado->isEmpty()
            ? null
            :  $planchado->map(function ($procesoTicket) {
                $timestampStart = Carbon::parse($procesoTicket->timestamp_start);
                $timestampEnd = Carbon::parse($procesoTicket->timestamp_end);

                $diff = $timestampStart->diff($timestampEnd);

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $diff->h,
                    'diferencia_en_minutos' => $diff->i,
                    'diferencia_en_segundos' => $diff->s,
                ];
            });

        // * Query de Proceso de Secado
        $secado = Ticket::join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->join('procesos', 'proceso_tickets.id_proceso', '=', 'procesos.id')
            ->join('users', 'users.id', '=', 'proceso_tickets.user_id')
            ->select('users.name', 'proceso_tickets.timestamp_start', 'proceso_tickets.timestamp_end')
            ->where('tickets.id', $id_ticket)
            ->where('procesos.nombre', 'SECADO')
            ->get();

        // * Logica de Proceso de Secado
        $resultSecado = $secado->isEmpty()
            ? null
            : $secado->map(function ($procesoTicket) {
                $timestampStart = Carbon::parse($procesoTicket->timestamp_start);
                $timestampEnd = Carbon::parse($procesoTicket->timestamp_end);

                $diff = $timestampStart->diff($timestampEnd);

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $diff->h,
                    'diferencia_en_minutos' => $diff->i,
                    'diferencia_en_segundos' => $diff->s,
                ];
            });

        // * Query de Proceso Entrega
        $entrega = Ticket::join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->join('procesos', 'proceso_tickets.id_proceso', '=', 'procesos.id')
            ->join('users', 'users.id', '=', 'proceso_tickets.user_id')
            ->select('users.name', 'proceso_tickets.timestamp_start', 'proceso_tickets.timestamp_end')
            ->where('tickets.id', $id_ticket)
            ->where('procesos.nombre', 'ENTREGA')
            ->get();

        // * Logica de Proceso Entrega
        $resultEntrega = $entrega->isEmpty()
            ? null
            :  $entrega->map(function ($procesoTicket) {
                $timestampStart = Carbon::parse($procesoTicket->timestamp_start);
                $timestampEnd = Carbon::parse($procesoTicket->timestamp_end);

                $diff = $timestampStart->diff($timestampEnd);

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $diff->h,
                    'diferencia_en_minutos' => $diff->i,
                    'diferencia_en_segundos' => $diff->s,
                ];
            });

        return response()->json([
            'Ticket' => $ticket,
            'Conteo' => $resultConteo ? $resultConteo[0] : null,
            'Lavado' => $resultLavado ? $resultLavado[0] : null,
            'Secado' => $resultSecado ? $resultSecado[0] : null,
            'Reconteo' => $resultReconteo ? $resultReconteo[0] : null,
            'Planchado' => $resultPlanchado ? $resultPlanchado[0] : null,
            'Entrega' => $resultEntrega ? $resultEntrega[0] : null
        ], 200);
    }

    /**
     * Continuación de la función reportGenVent.
     *
     * Esta función calcula los totales de los tickets por método de pago (efectivo, transferencia, tarjeta) y los devuelve en un objeto JSON.
     * También calcula el monto total sumando los totales de cada método de pago.
     * Si ocurre un error durante el cálculo de los totales, la función devuelve un mensaje de error en un objeto JSON.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception Si hay un error al calcular los totales.
    */
    public function reportGenVent(Request $request): JsonResponse
    {
        $request->validate([
            'fecha_inicio' => ['date_format:Y-m-d H:i:s', 'nullable'],
            'fecha_fin' => ['date_format:Y-m-d H:i:s', 'nullable', 'after_or_equal:fecha_inicio']
        ]);

        $inicioFechaConsulta = $request->fecha_inicio;
        $finFechaConsulta = $request->fecha_fin;

        try {
            if (empty($inicioFechaConsulta) && empty($finFechaConsulta)) {
                // Fecha Inicio y Final no Proporcinadas
                $inicioFechaConsulta = Carbon::now()->startOfDay();
                $finFechaConsulta = Carbon::now()->endOfDay();
            } else {
                /// Fechas Proporcinadas
                $inicioFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_inicio'))->startOfDay();
                $finFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_fin'))->endOfDay();
            }

            $tickets = Ticket::join('clientes', 'clientes.id', '=', 'tickets.id_cliente')
                ->join('anticipo_tickets', 'anticipo_tickets.id_ticket', '=', 'tickets.id')
                ->select(
                    'tickets.id',
                    'anticipo_tickets.metodopago',
                    'anticipo_tickets.numero_referencia',
                    'tickets.total',
                    'anticipo_tickets.anticipo',
                    'anticipo_tickets.restante',
                    'clientes.nombre',
                    'anticipo_tickets.cobrado_por'
                )
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->distinct('anticipo_tickets.id_ticket')
                ->get();

            // Desencriptar la referencia y agregarla al array $tickets
            foreach ($tickets as $ticket) {
                $ticket->cobrado_por = !empty($ticket->cobrado_por) ? User::find($ticket->cobrado_por)->name : null;

                if (!empty($ticket->numero_referencia)) {
                    $ticket->numero_referencia = Crypt::decrypt($ticket->numero_referencia);

                    // Esto sirve para mostrar solo los ultimos tres digitos de numero_referencia
                    $longitud = strlen($ticket->numero_referencia);
                    if ($longitud >= 3) {
                        $ultimosTresCaracteres = substr($ticket->numero_referencia, -3);
                        $ticket->numero_referencia = str_repeat('*', $longitud - 3) . $ultimosTresCaracteres;
                    }
                } else {
                    $ticket->numero_referencia;
                }
            }

            $efectivoCredPendiente = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('anticipo_tickets.restante', '>', 0)
                ->where('tickets.tipo_credito', 'CREDITO')
                ->where('anticipo_tickets.metodopago', 'EFECTIVO')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $efectivoCredPagado = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('anticipo_tickets.restante', 0)
                ->where('tickets.tipo_credito', 'CREDITO')
                ->where('anticipo_tickets.metodopago', 'EFECTIVO')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $efectivo = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.tipo_credito', 'CONTADO')
                ->where('anticipo_tickets.metodopago', 'EFECTIVO')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('tickets.total');

            $transferencia = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.tipo_credito', 'CONTADO')
                ->where('anticipo_tickets.metodopago', 'TRANSFERENCIA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('tickets.total');

            $transferenciaAnticipos = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('anticipo_tickets.restante', '>', 0)
                ->where('tickets.tipo_credito', 'CONTADO')
                ->where('anticipo_tickets.metodopago', 'TRANSFERENCIA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $transferenciaAnticiposX = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('anticipo_tickets.restante', '>=', 0)
                ->where('tickets.tipo_credito', 'CREDITO')
                ->where('anticipo_tickets.metodopago', 'TRANSFERENCIA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $tarjeta = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.tipo_credito', 'CONTADO')
                ->where('anticipo_tickets.metodopago', 'TARJETA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('tickets.total');

            $tarjetaAnticipos = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('anticipo_tickets.restante', '>', 0)
                ->whereIn('tickets.tipo_credito', ['CONTADO', 'CREDITO'])
                ->where('anticipo_tickets.metodopago', 'TARJETA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $efectivoT = (float) round($efectivo + $efectivoCredPendiente + $efectivoCredPagado, 2);
            $transferenciaT = (float) round($transferencia + $transferenciaAnticipos + $transferenciaAnticiposX, 2);
            $tarjetaT = (float) round($tarjeta + $tarjetaAnticipos, 2);
            $montoTotal = (float) round($efectivoT + $transferenciaT + $tarjetaT, 2);

            return response()->json([
                'tickets' => $tickets,
                'efectivo' => $efectivoT,
                'transferencia' => $transferenciaT,
                'tarjeta' => $tarjetaT,
                'montoTotal' => $montoTotal
            ]);
        } catch (\Exception $e) {
            // Fecha no valida
            return response()->json(
                [
                    'mensaje' => $e->getMessage()
                ],
                500
            );
        }
    }

    public function InformVentCategorias($Finicio, $Ffin)
    {
        $total = Ticket::join('servicio_tickets', 'tickets.id', '=', 'servicio_tickets.id_ticket')
            ->join('servicios', 'servicio_tickets.id_servicio', '=', 'servicios.id')
            ->join('catalogos', 'servicios.catalogo_id', '=', 'catalogos.id')
            ->whereBetween('tickets.created_at', [$Finicio, $Ffin])
            ->select('catalogos.name as catalogo_name', DB::raw('SUM(tickets.total) as total'))
            ->groupBy('catalogos.name')
            ->get();

        return $total;
    }

    public function InformVentSucursales($Finicio, $Ffin)
    {
        $total = Ticket::join('sucursales', 'sucursales.id', '=', 'tickets.id_sucursal')
            ->whereBetween('tickets.created_at', [$Finicio, $Ffin])
            ->select('sucursales.nombre as sucursales_nombre', DB::raw('SUM(tickets.total) as total'))
            ->groupBy('sucursales.nombre')
            ->get();

        return $total;
    }

    /**
     * Genera un Pdf con los datos de Reporte General de Venta
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     * 
     * * Funciones usadas dentro de repGenVentPdf
     * @see statsController::reportGenVent($request)
     * @see statsController::generateReport($request)
     * 
     * @see statsController::InformVentCategorias($Finicio, $Ffin)
     * @see statsController::InformVentSucursales($Finicio, $Ffin)
     */
    public function repGenVentPdf(Request $request)
    {
        $request->validate([
            'fecha_inicio' => ['date_format:Y-m-d H:i:s', 'nullable'],
            'fecha_fin' => ['date_format:Y-m-d H:i:s', 'nullable', 'after_or_equal:fecha_inicio']
        ]);

        $reportGeneral = $this->reportGenVent($request); // Accede a la funcion reportGenVent de esta misma clase
        $totalesReporte = $this->generateReport($request); // Accede a la funcion reportGenVent de esta misma clase

        // Obtiene el contenido de la respuesta
        $contenidoRG = $reportGeneral->getContent();
        $contenidoTotal = $totalesReporte->getContent();

        // Decodifica el contenido JSON
        $datos = json_decode($contenidoRG, true);
        $datos2 = json_decode($contenidoTotal, true);

        // Inicializamos la fecha con Carbon
        $fecha_inicio = Carbon::parse($request->fecha_inicio);
        $fecha_fin = Carbon::parse($request->fecha_fin);

        // Numero de Tickets En el Periodo Dado
        $contenedor = [];
        foreach ($datos['tickets'] as $ticket) {
            $contenedor[] = $ticket['id'];
        }
        $idSinRep = count(array_unique($contenedor));

        // * Dia con Mayor venta
        $resultado = Ticket::selectRaw('DATE(created_at) as fecha, SUM(total) as totalAnticipos')
            ->whereBetween('created_at', [$fecha_inicio, $fecha_fin])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('totalAnticipos', 'desc')
            ->first();

        // * Dia con ventas más bajas
        $resultado_min = Ticket::selectRaw('DATE(created_at) as fecha, SUM(total) as totalAnticipos')
            ->whereBetween('created_at', [$fecha_inicio, $fecha_fin])
            ->groupBy(DB::raw('DATE(created_at)')) // Agrupo los created_at
            ->orderBy('totalAnticipos', 'asc')
            ->first();

        $fecha_max_venta = optional($resultado)->fecha; // Obtengo la fecha de la consulta
        $total_max_anticipos = optional($resultado)->totalAnticipos; // Obtengo la caontidad maxima ganada

        $fecha_min_venta = optional($resultado_min)->fecha;
        $total_min_anticipos = optional($resultado_min)->totalAnticipos;

        // * >>>> Venta Diaria Promedio <<<<<
        BusinessDay::enable('Carbon\Carbon', 'mx', [
            'new-year' => '01-01',
            'christmas' => '12-25',
        ]);

        // Crea un periodo de fechas desde fecha_inicio hasta fecha_fin
        $periodo = new CarbonPeriod($fecha_inicio->format('Y-m-d'), $fecha_fin->format('Y-m-d'));

        // Calcula el número de días hábiles en el periodo
        $dias_habiles = 0;
        $dias_festibos = 0;
        foreach ($periodo as $fecha) {
            if ($fecha->isHoliday()) { // Verifica si los dias agregados anteriormente
                $dias_festibos++;
            } else if (!$fecha->isWeekend()) {
                $dias_habiles++;
            }
        }

        // Asume que $importe_ventas es el importe total de las ventas en el rango de fechas
        $resultadoDiarioPromedio = $datos2['montoCobrado'] / $dias_habiles;
        $venta_diaria_promedio = round($resultadoDiarioPromedio, 2);

        // * >>>> Ticket Promedio <<<<<
        if ($datos2['montoCobrado']) {
            $ticketProm = round($datos2['montoCobrado'] / $idSinRep);
        } else {
            $ticketProm = 0;
        }

        // * INFORME DE VENTAS POR CATEGORIA
        //      Resultados Iterados en el Contanido del Documento $html
        $resultados = $this->InformVentCategorias($request->fecha_inicio, $request->fecha_fin);

        // * INFORME DE VENTAS POR SITIO
        //      Resultados Iterados en el Contanido del Documento $html
        $resultados2 = $this->InformVentSucursales($request->fecha_inicio, $request->fecha_fin);

        $pdf = app('dompdf.wrapper');
        $html = "
            <style>
                p {
                    text-align: center;
                    font-size: 13px;
                }
                table:nth-of-type(1) {
                    width: 90%;
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
                    text-align: left;
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
                .verdeBag {
                    background-color : #008080;
                    color : #ffffff;
                }
                .bordestd {
                    border-bottom: 1px solid rgb(86, 197, 252);
                }
            </style>";

        $html .= "<h1 class='texto verdeBag'>Reporte General de Ventas</h1>";
        $html .= "<p class='alinear-derecha negrita'>Dias Festivos:" . $dias_festibos . "</p>";
        $html .= "<p class='alinear-derecha'>Periodo: " . $fecha_inicio->format('Y-m-d') . " - " . $fecha_fin->format('Y-m-d') . "</p>";
        $html .= "<h5 class='negrita texto'>INFORME GENERAL DE VENTAS</h5>";

        $html .= "<table>"; // Tabla Principal de Informe General de Ventas

        $html .= "<tr>";
        $html .= "<td class='negrita'>" . "Importe de Ventas: " . "</td>";
        $html .= "<td class='bordestd texto'>$ " . $datos2['montoCobrado'] . "</td>";

        $html .= "<tr>";
        $html .= "<td class='negrita'>" . "Ingresos Totales: " . "</td>";
        $html .= "<td class='bordestd texto'>$ " . $datos2['totalIngresos'] . "</td>";

        // * Aqui va la parte de totales en forma de pago
        $html .= "<tr>";
        $html .= "<td class='texto'>" . "Efectivo" . "</td>";
        $html .= "<td>$ " . $datos['efectivo'] . "</td>";
        $html .= "<td class='texto negrita'>" . "Venta Diaria Promedio: " . "</td>";

        $html .= "<tr>";
        $html .= "<td class='texto'>" . "Transferencia" . "</td>";
        $html .= "<td> $" . $datos['transferencia'] . "</td>";
        $html .= "<td class='texto'>" . $venta_diaria_promedio . "</td>";

        $html .= "<tr>";
        $html .= "<td class='texto'>" . "Tarjeta" . "</td>";
        $html .= "<td> $" . $datos['tarjeta'] . "</td>";
        $html .= "<td class='texto negrita'>" . "Ticket Promedio: " . "</td>";
        // * Aqui va la parte de totales en forma de pago

        $html .= "<tr>";
        $html .= "<td class='negrita'>" . "Por Cobrar: " . "</td>";
        $html .= "<td class='bordestd texto'>$ " . $datos2['montoPorCobrar'] . "</td>";
        $html .= "<td class='texto'> $ " . $ticketProm . "</td>";

        $html .= "<tr>";
        $html .= "<td class='negrita'>" . "Dia de Mayor Venta: " . "</td>";
        $html .= "<td class='bordestd texto'>" . $fecha_max_venta . "</td>";

        $html .= "<tr>";
        $html .= "<td class='negrita'>" . "Dia de Menor Venta: " . "</td>";
        $html .= "<td class='bordestd texto'>" . $fecha_min_venta . "</td>";

        $html .= "<tr>";
        $html .= "<td class='negrita'>" . "Total e Tickets: " . "</td>";
        $html .= "<td class='bordestd texto'>" . $idSinRep . "</td>";

        $html .= "</table>";

        $html .= "<h5 class='negrita texto'>INFORME DE VENTAS POR CATEGORÍAS</h5>";

        $html .= "<table>"; // Tabla Informe Ventas por Catalogo(categorias)
        $html .= "<tr>";
        $html .= "<th>" . "Punto de Venta: " . "</th>";
        $html .= "<th>" . "Importes" . "</th>";
        $html .= "<th>" . "%" . "</th>";
        $html .= "</tr>";

        if (empty($resultados)) {
            $html .= '<tr>';
            $html .= "<td>Sin resultados que mostrar</td>";
            $html .= '</tr>';
        }

        foreach ($resultados as $resultado) :
            $porcentaje = round($resultado->total /  $datos2['montoCobrado'] * 100, 2);
            $html .= "<tr>";
            $html .= "<td>" . $resultado->catalogo_name . "</td>";
            $html .= "<td>$ " . round($resultado->total, 2) . "</td>";
            $html .= "<td>" . $porcentaje . "%</td>";
            $html .= "</tr>";
        endforeach;
        $html .= "</table>";

        $html .= "<h5 class='negrita texto'>PUNTOS DE VENTA POR SITIO</h5>";

        $html .= "<table>"; // Tabla Informe Ventas por Sitio(Sucursal)
        $html .= "<tr>";
        $html .= "<th>" . "Punto de Venta: " . "</th>";
        $html .= "<th>" . "Importes" . "</th>";
        $html .= "<th>" . "%" . "</th>";
        $html .= "</tr>";

        if (empty($resultados2)) {
            $html .= '<tr>';
            $html .= "<td>Sin resultados que mostrar</td>";
            $html .= '</tr>';
        }

        foreach ($resultados2 as $resultado) :
            $porcentaje = round($resultado->total /  $datos2['montoCobrado'] * 100, 2);
            $html .= '<tr>';
            $html .= "<td>" . $resultado->sucursales_nombre . "</td>";
            $html .= "<td> $" . round($resultado->total, 2) . "</td>";
            $html .= "<td>" . $porcentaje . "%</td>";
            $html .= '<tr>';
        endforeach;
        $html .= "</table>";

        $pdf->loadHTML($html);
        return $pdf->download("ReporteGeneral $request->fecha_inicio - $request->fecha_fin.pdf");
    }
}
