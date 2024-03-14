<?php

namespace App\Http\Controllers;

use App\Models\AnticipoEnvio;
use App\Models\Ticket;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFound;

class AnticipoEnvioController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return AnticipoEnvio::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'anticipo' => ['required', 'numeric', 'min:0'],
            'metodopago' => ['required', 'in:EFECTIVO,TARJETA,TRANSFERENCIA'],
            'id_ticket' => ['required', 'exists:tickets,id'],
            'numero_referencia' => ['nullable', 'string', 'min:5'],
            'restante' => ['nullable']
        ]);

        try {
            $ticket = Ticket::where('id', $request->id_ticket)->firstOrFail();
        } catch (ModelNotFound $e) {
            return response()->json(['error' => 'Ticket no encontrado'], 404);
        }

        $totalAnticiposEnvio = AnticipoEnvio::where('id_ticket', $ticket->id)->sum('anticipo');
        $totalAnticiposEnvio += $request->anticipo;

        $restante = $ticket->costo_envio - $totalAnticiposEnvio;

        if (floatval($request->anticipo) > floatval($ticket->restante_envio) || floatval($request->anticipo) < 1) {
            return response()->json([
                'mensaje' => 'El acticipo no puede ser mayor o menor al restante'
            ],422);
        }

        // Encryptacion de numero de referencia
        Log::info($request->numero_referencia);
        $numeroTargetaCifrado = isset($request->numero_referencia)
            ? Crypt::encrypt($request->numero_referencia)
            : null;

        Log::info($request->metodopago);
        $anticipo = AnticipoEnvio::create([
            'anticipo' => $request->anticipo,
            'metodopago' => $request->metodopago,
            'id_ticket' => $request->id_ticket,
            'cobrado_por' => $request->user()->id,
            'numero_referencia' => $numeroTargetaCifrado,
            'restante' => $restante
        ]);

        if ($ticket->tipo_credito === 'CREDITO') {

            $nuevoRestante = floatval($ticket->restante_envio) - floatval($request->anticipo);
            $ticket->update([
                'restante_envio' => $nuevoRestante
            ]);
        }

        return response()->json([
            'mensaje' => 'Anticipo generado exitosamente',
            'data' => $anticipo
        ]);
    }
}
