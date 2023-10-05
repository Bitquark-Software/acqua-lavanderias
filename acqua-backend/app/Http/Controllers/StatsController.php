<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Ticket;
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
            $montoTicketsPagadosAContado = Ticket::where('restante', 0)
                ->where('tipo_credito', 'CONTADO')
                ->where('vencido', false)
                ->whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('total');

            // * Consulta para metodo de pago "Credito" Total
            $montoTicketsTotalACredito = Ticket::where('restante', 0)
                ->where('tipo_credito', 'CREDITO')
                ->where('vencido', false)
                ->whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('total');

            // * Consulta para metodo de pago "Credito" Pagado
            $montoTicketsACreditoPagado = Ticket::where('restante', 0)
                ->where('tipo_credito', 'CREDITO')
                ->where('vencido', false)
                ->whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo');

            // * Consulta para metodo de pago "Credito" Pendiente
            $montoTicketsACreditoPendiente = Ticket::where('restante', '>', 0)
                ->where('tipo_credito', 'CREDITO')
                ->where('vencido', false)
                ->whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('restante');

            return response()->json([
                'totalIngresos' => (floatval($montoTicketsPagadosAContado + $montoTicketsTotalACredito)),
                'montoCobrado' => floatval(($montoTicketsPagadosAContado + $montoTicketsACreditoPagado)),
                'montoPorCobrar' => floatVal($montoTicketsACreditoPendiente)
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
                    'tickets.metodo_pago',
                    'tickets.numero_referencia',
                    'tickets.total',
                    'tickets.anticipo',
                    'tickets.restante',
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

            $efectivo = Ticket::where('metodo_pago', 'EFECTIVO')
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('total');

            $transferencia = Ticket::where('metodo_pago', 'TRANSFERENCIA')
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('total');

            $tarjeta = Ticket::where('metodo_pago', 'TARJETA')
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('total');

            return response()->json([
                'tickets' => $tickets,
                'efectivo' => $efectivo,
                'transferencia' => $transferencia,
                'tarjeta' => $tarjeta
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
