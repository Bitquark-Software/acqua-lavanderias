<?php

namespace App\Http\Controllers;

use App\Models\Comentario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Ticket;

class ComentarioController extends Controller
{

    public function store(Request $request): JsonResponse
    {
        $this->validate($request, [
            'texto' => ['required', 'max:255'],
            'ticket_id' => ['required', 'exists:tickets,id']
        ]);
        // Obtener el ID del usuario autenticado
        $user_id = Auth::id();

        // Verificar si el ticket existe
        $ticket = Ticket::findOrFail($request->ticket_id);

        // Almacenar resultados
        $comentario = Comentario::create([
            'user_id' => $user_id,
            'ticket_id' => $ticket->id,
            'texto' => $request->texto,
        ]);

        return response()->json([
            'message' => 'Comentario Agregado Exitosamente',
            'data' => $comentario,
        ]);
    }
}
