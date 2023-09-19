<?php

namespace App\Http\Controllers;

use App\Models\AnticipoTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnticiposTicketsController extends Controller
{
    public function index() 
    {
        return AnticipoTicket::all();
    }
    
    public function store(Request $request) : JsonResponse
    {
        $request->validate([
            'anticipo' => ['required', 'numeric', 'min:0'],
            'metodopago' => ['required', 'in:EFECTIVO,TARJETA,TRANSFERENCIA'],
            'id_ticket' => ['required', 'exists:tickets,id']
        ]);

        $anticipo = AnticipoTicket::create([
            'anticipo' => $request->anticipo,
            'metodopago' => $request->metodopago,
            'id_ticket' => $request->id_ticket,
            'cobrado_por' => $request->user()->id
        ]);

        return response()->json([
            'mensaje' => 'Anticipo generado exitosamente',
            'data' => $anticipo
        ], 201);
    }
}
