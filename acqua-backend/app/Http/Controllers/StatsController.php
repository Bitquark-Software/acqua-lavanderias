<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Ticket;
use App\Models\AnticipoTicket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Crypt;

class StatsController extends Controller
{

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

            $totalIngresos = (float) $montoTicketsTotal;
            $montoCobrado = (float) ($montoTicketsPagadosAContado + $montoTicketsACreditoPagado);
            $montoPorCobrar = (float) ($montoTicketsTotal - $montoCobrado);

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
                ->leftJoin('anticipo_tickets', 'anticipo_tickets.id_ticket', '=', 'tickets.id')
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
                ->where('anticipo_tickets.restante', '>=' , 0)
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
                ->whereIn('tickets.tipo_credito', ['CONTADO','CREDITO'])
                ->where('anticipo_tickets.metodopago', 'TARJETA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $efectivoT = (float) ($efectivo + $efectivoCredPendiente + $efectivoCredPagado);
            $transferenciaT = (float) ($transferencia + $transferenciaAnticipos + $transferenciaAnticiposX);
            $tarjetaT = (float) ($tarjeta + $tarjetaAnticipos);
            $montoTotal = (float) ($efectivoT + $transferenciaT + $tarjetaT);

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
}
