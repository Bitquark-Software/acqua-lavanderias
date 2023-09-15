<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Ticket;
use Carbon\Carbon;


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
                'totalIngresos' => (string) ($montoTicketsPagadosAContado + $montoTicketsTotalACredito),
                'montoCobrado' => (string) ($montoTicketsPagadosAContado + $montoTicketsACreditoPagado),
                'montoPorCobrar' => (string) $montoTicketsACreditoPendiente
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

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $timestampStart->diffInHours($timestampEnd),
                    'diferencia_en_minutos' => $timestampStart->diffInMinutes($timestampEnd),
                    'diferencia_en_segundos' => $timestampStart->diffInSeconds($timestampEnd),
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

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $timestampStart->diffInHours($timestampEnd),
                    'diferencia_en_minutos' => $timestampStart->diffInMinutes($timestampEnd),
                    'diferencia_en_segundos' => $timestampStart->diffInSeconds($timestampEnd),
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

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $timestampStart->diffInHours($timestampEnd),
                    'diferencia_en_minutos' => $timestampStart->diffInMinutes($timestampEnd),
                    'diferencia_en_segundos' => $timestampStart->diffInSeconds($timestampEnd),
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

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $timestampStart->diffInHours($timestampEnd),
                    'diferencia_en_minutos' => $timestampStart->diffInMinutes($timestampEnd),
                    'diferencia_en_segundos' => $timestampStart->diffInSeconds($timestampEnd),
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

                return [
                    'nombre' => $procesoTicket->name,
                    'timestamp_start' => $procesoTicket->timestamp_start,
                    'timestamp_end' => $procesoTicket->timestamp_end,
                    'diferencia_en_dias' => $timestampStart->diffInDays($timestampEnd),
                    'diferencia_en_horas' => $timestampStart->diffInHours($timestampEnd),
                    'diferencia_en_minutos' => $timestampStart->diffInMinutes($timestampEnd),
                    'diferencia_en_segundos' => $timestampStart->diffInSeconds($timestampEnd),
                ];
            });

        return response()->json([
            'Ticket' => $ticket,
            'Conteo' => $resultConteo,
            "Lavado" => $resultLavado,
            'Reconteo' => $resultReconteo,
            'Planchado' => $resultPlanchado,
            'Entrega' => $resultEntrega
        ], 200);
    }
}
