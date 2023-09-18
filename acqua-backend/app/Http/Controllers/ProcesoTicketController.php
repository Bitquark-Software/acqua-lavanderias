<?php

namespace App\Http\Controllers;

use App\Models\Proceso;
use App\Models\ProcesoTicket;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\Request;


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

        $yaExisteProceso = ProcesoTicket::where([
            [ 'id_ticket', $request->id_ticket ],
            [ 'id_proceso', $request->id_proceso ]],
        )->first();

        if($yaExisteProceso)
        {
            return response()->json([
                'mensaje' => "Proceso ticket ya existente",
            ], 200);
        }

        // actualizar el status del ticket
        $procesoNuevo = Proceso::where('id',$request->id_proceso)->first();
        $ticket = Ticket::where('id', $request->id_ticket)->first();
        $ticket->updateOrFail([
            'status' => $procesoNuevo->nombre == 'CONTEO' ? 'CREADO' : $procesoNuevo->nombre
        ]);

        $procesoTicket = ProcesoTicket::create([
            'id_ticket' => $request->id_ticket,
            'id_proceso' => $request->id_proceso,
            'timestamp_start' => Carbon::now(),
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
            'id_lavadora' => ['nullable', 'exists:lavadoras,id', 'integer'],      
            'id_secadora' => ['nullable', 'exists:secadoras,id', 'integer'],
        ]);

        $procesoTicket = ProcesoTicket::findOrFail($id);

        if(!isset($procesoTicket->timestamp_end) && $request->id_lavadora == null)
        {
            $procesoTicket->update([
                'timestamp_end' => Carbon::now(),
            ]);
        }

        if(isset($request->id_lavadora))
        {
            $procesoTicket->update([
                'id_lavadora' => $request->id_lavadora,
            ]);
        }

        if(isset($request->id_secadora))
        {
            $procesoTicket->update([
                'id_secadora' => $request->id_secadora
            ]);
        }

        return response()->json([
            'mensaje' => 'Proceso ticket actualizado'
        ], 200);
    }
}
