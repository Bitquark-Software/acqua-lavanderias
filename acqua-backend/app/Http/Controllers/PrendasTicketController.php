<?php

namespace App\Http\Controllers;

use App\Models\Prendas_Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrendasTicketController extends Controller
{

    public function index()
    {
        return Prendas_Ticket::all();
    }

    public function store(Request $request) : JsonResponse
    {
        $request->validate([
            'id_ticket' => ['required', 'exists:tickets,id'],
            'id_prenda' => ['required', 'exists:prendas,id'],
            'total_inicial' => ['required', 'numeric'],
            'total_final' => ['required', 'numeric']
        ]);

        $proceso = Prendas_Ticket::create([
            'id_ticket' => $request->id_ticket,
            'id_prenda' => $request->id_prenda,
            'total_inicial' => $request->total_inicial,
            'total_final' => $request->total_final
        ]);

        return response()->json([
            'mensaje' => 'Ticket proceso generado exitosamente',
            'data' => $proceso,
        ], 201);
    }
}
