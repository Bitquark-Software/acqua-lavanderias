<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Ticket;
use App\Models\Proceso;
use Illuminate\Http\Request;
use App\Models\ProcesoTicket;


class ProcesoTicketController extends Controller
{
    /**
     * Este método agrega lavadoras y secadoras.
     *
     * @param Request $request La solicitud del cliente
     * @return response Devuelve una respuesta JSON basada en la validación y ejecución.
     *
     * El método valida los datos de entrada, recupera los procesos 'LAVADO' y 'SECADO', verifica 
     * si la lavadora o secadora ingresada es la misma que la de la base de datos, y crea un ProcesoTicket.
     */
    public function addLavadorasSecadoras(Request $request)
    {
        // Validar que solo uno de los dos, lavadora o secadora, tenga un valor
        if ($request->has('lavadora') === $request->has('secadora')) {
            return response()->json([
                'mensaje' => 'Solo se puede enviar un valor entre lavadora y secadora.',
            ], 400);
        }

        $request->validate([
            'timestamp_start' => ['nullable', 'date_format:Y-m-d H:i:s'],
            'timestamp_end' => ['nullable', 'date_format:Y-m-d H:i:s', 'after:timestamp_start'],
            'lavadora' => ['nullable', 'exists:lavadoras,id'],
            'secadora' => ['nullable', 'exists:secadoras,id'],
            'id_ticket' => ['required', 'exists:tickets,id']
        ]);

        // * Seccion para verificar que la lavadora no sea la misma
        // Obtén los procesos 'LAVADO' y 'SECADO'
        $procesos = Proceso::whereIn('nombre', ['LAVADO', 'SECADO'])->get()->keyBy('nombre');

        $id_proceso = null;
        $cambio = '';

        if ($request->has('lavadora')) {
            $id_proceso = $procesos['LAVADO']->id;
            $cambio = 'lavadora';
        } else {
            $id_proceso = $procesos['SECADO']->id;
            $cambio = 'secadora';
        }

        try {
            $registros = Ticket::join('proceso_tickets', 'tickets.id', '=', 'proceso_tickets.id_ticket')
            ->where('tickets.id', $request->id_ticket)
            ->where('proceso_tickets.id_proceso', $id_proceso)
            ->first();
        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'No se encontraron registros guardados de lavoras y secadoras'
            ], 404);
        }

        // *  No fueron encontrados registros de Lavado y Secado
        if (!$procesos['LAVADO'] || !$procesos['SECADO']) {
            return response()->json([
                'mensaje' => 'Los procesos LAVADO y/o SECADO no fueron encontrados'
            ], 404);
        }

        // * Bloque que verifica si la lavadora o secadora ingresada es igual a la BD
        if (isset($registros['id_lavadora']) && $registros['id_lavadora'] === $request->lavadora) {
            return response()->json([
                'mensaje' => 'Lavadora adicional ingresada es la misma que la ya registrada.'
            ], 400);
        }

        if (isset($registros['id_secadora']) && $registros['id_secadora'] === $request->secadora) {
            return response()->json([
                'mensaje' => 'Secadora adicional ingresada es la misma que la ya registrada.'
            ], 400);
        }

        $procesoTicket = ProcesoTicket::create([
            'id_ticket' => $request->id_ticket,
            'id_proceso' => $id_proceso,
            'timestamp_start' => Carbon::now(),
            'timestamp_end' => $request->timestamp_end,
            'user_id' => $request->user()->id,
            'id_lavadora' => $request->lavadora,
            'id_secadora' => $request->secadora
        ]);

        return response()->json([
            'mensaje' => $cambio . " extra agregada",
            'data' => $procesoTicket
        ], 200);
    }

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

        $yaExisteProceso = ProcesoTicket::where(
            [
                ['id_ticket', $request->id_ticket],
                ['id_proceso', $request->id_proceso]
            ],
        )->first();

        if ($yaExisteProceso) {
            return response()->json([
                'mensaje' => "Proceso ticket ya existente",
            ], 200);
        }

        // actualizar el status del ticket
        $procesoNuevo = Proceso::where('id', $request->id_proceso)->first();
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
        // Veriificar si tiene lavadora extra hacerle update tambien
        $request->validate([
            'id_lavadora' => ['nullable', 'exists:lavadoras,id', 'integer'],
            'id_secadora' => ['nullable', 'exists:secadoras,id', 'integer'],
        ]);

        $procesoTicket = ProcesoTicket::findOrFail($id);

        if (!isset($procesoTicket->timestamp_end) && $request->id_lavadora == null) {
            $procesoTicket->update([
                'timestamp_end' => Carbon::now(),
            ]);
        }

        if (isset($request->id_lavadora)) {
            $procesoTicket->update([
                'id_lavadora' => $request->id_lavadora,
            ]);
        }

        if (isset($request->id_secadora)) {
            $procesoTicket->update([
                'id_secadora' => $request->id_secadora
            ]);
        }

        return response()->json([
            'mensaje' => 'Proceso ticket actualizado'
        ], 200);
    }
}
