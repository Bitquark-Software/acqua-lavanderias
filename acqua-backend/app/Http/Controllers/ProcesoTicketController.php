<?php

namespace App\Http\Controllers;

use App\Models\ProcesoTicket;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProcesoTicketController extends Controller
{
    public function index()
    {
        return ProcesoTicket::orderBy('created_at', 'desc')->paginate(15);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_ticket' => ['required', 'exists:tickets,id'],
            'id_proceso' => ['required', 'exists:procesos,id'],
            'timestamp_start' => ['nullable', 'date_format:Y-m-d H:i:s'],
            'timestamp_end' => ['nullable', 'date_format:Y-m-d H:i:s', 'after:timestamp_start'],            
            'id_lavadora' => ['nullable', 'exists:lavadoras,id', 'integer'],
            'id_secadora' => ['nullable', 'exists:secadoras,id', 'integer'],
        ]);

        $procesoTicket = ProcesoTicket::create([
            'id_ticket' => $request->id_ticket,
            'id_proceso' => $request->id_proceso,
            'timestamp_start' => $request->timestamp_start,
            'timestamp_end' => $request->timestamp_end,
            'user_id' => $request->user()->id,
            'id_lavadora' => $request->id_lavadora,
            'id_secadora' => $request->id_secadora
        ]);

        return response()->json([
            'mensaje' => "Proceso ticket generado exitosamente",
            'data' => $procesoTicket
        ], 201);
    }

    public function show($id)
    {
        return ProcesoTicket::with('ticket', 'proceso', 'user', 'lavadora', 'secadora')->find($id);
    }

    public function update(Request $request, $id) 
    {
        $request->validate([
            'timestamp_end' => ['nullable', 'date_format:Y-m-d H:i:s', 'after:timestamp_start'],      
        ]);

        $procesoTicket = ProcesoTicket::findOrFail($id);

        $procesoTicket->update([
            'timestamp_end' => $request->timestamp_end
        ]);

        return response()->json([
            'mensaje' => 'Proceso ticket actualizado'
        ], 200);
    }
}
