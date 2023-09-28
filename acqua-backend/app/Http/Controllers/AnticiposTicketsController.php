<?php

namespace App\Http\Controllers;

use App\Models\AnticipoTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

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
            'numero_referencia' => ['nullable', 'string', 'min:18']
        ]);

        // Encyptacion de Numero de refencia
        $numeroTargetaCifrado = !is_null($request->numero_referencia)
            ? Crypt::encrypt($request->numero_referencia)
            : null;

        $anticipo = AnticipoTicket::create([
            'anticipo' => $request->anticipo,
            'metodopago' => $request->metodopago,
            'id_ticket' => $request->id_ticket,
            'cobrado_por' => $request->user()->id,
            'numero_referenccia' => $numeroTargetaCifrado
        ]);

        return response()->json([
            'mensaje' => 'Anticipo generado exitosamente',
            'data' => $anticipo
        ], 201);
    }
}
