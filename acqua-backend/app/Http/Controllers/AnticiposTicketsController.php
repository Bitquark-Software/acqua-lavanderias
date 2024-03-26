<?php

namespace App\Http\Controllers;

use App\Models\AnticipoTicket;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class AnticiposTicketsController extends Controller
{
    public function index()
    {
        return AnticipoTicket::all();
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'anticipo' => ['required', 'numeric', 'min:0'],
            'metodopago' => ['required', 'in:EFECTIVO,TARJETA,TRANSFERENCIA'],
            'id_ticket' => ['required', 'exists:tickets,id'],
            'numero_referencia' => ['nullable', 'string', 'min:5'],
            'restante' => ['nullable']
        ]);

        Log::info($request->metodopago);

        // Actualizar el ticket
        $ticket = Ticket::where('id', $request->id_ticket)->first();

        // Verificar si el ticket actual es igual al de el usuario logueado
        if ($ticket->id_sucursal !== $request->user()->id_sucursal) {
            return response()->json([
                'mensaje' => "No puedes generar anticipos por que no es tu sucursal"
            ]);
        }

        $total_anticipos = AnticipoTicket::where('id_ticket', $ticket->id)->sum('anticipo');
        $total_anticipos += $request->anticipo;

        $restante = $ticket->total - $total_anticipos;

        if(!$ticket)
        {
            return response()->json([
                'message' => 'Ticket no existente',
            ], 422);
        }
        if(floatval($request->anticipo) > $ticket->restante || floatval($request->anticipo) < 1)
        {
            return response()->json([
                'message' => 'El anticipo no puede ser mayor o menor al restante',
            ], 422);
        }

        // Encyptacion de referencia
        Log::info($request->numero_referencia);
        $numeroTarjetaCifrado = isset($request->numero_referencia)
            ? Crypt::encrypt($request->numero_referencia)
            : null;

        Log::info($request->metodopago);
        $anticipo = AnticipoTicket::create([
            'anticipo' => $request->anticipo,
            'metodopago' => $request->metodopago,
            'id_ticket' => $request->id_ticket,
            'cobrado_por' => $request->user()->id,
            'numero_referencia' => $numeroTarjetaCifrado,
            'restante' => $restante
        ]);

        if($ticket->tipo_credito == 'CREDITO')
        {
            $nuevoRestante = floatval($ticket->restante) - floatval($request->anticipo);
            $nuevoAnticipo = floatval($ticket->anticipo) + floatval($request->anticipo);
            $ticket->update([
                'anticipo' => $nuevoAnticipo,
                'restante' => $nuevoRestante,
            ]);
        }

        return response()->json([
            'mensaje' => 'Anticipo generado exitosamente',
            'data' => $anticipo
        ], 201);
    }
}
