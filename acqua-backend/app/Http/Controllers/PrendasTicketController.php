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
            'total_inicial' => ['nullable', 'numeric'],
            'total_final' => ['nullable', 'numeric']
        ]);

        $proceso = Prendas_Ticket::create([
            'id_ticket' => $request->id_ticket,
            'id_prenda' => $request->id_prenda,
            'total_inicial' => $request->total_inicial ?? 0,
            'total_final' => $request->total_final ?? 0
        ]);

        return response()->json([
            'mensaje' => 'Ticket proceso generado exitosamente',
            'data' => $proceso,
        ], 201);
    }
}
