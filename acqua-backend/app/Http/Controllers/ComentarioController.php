<?php

namespace App\Http\Controllers;

use App\Models\Comentario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;

class ComentarioController extends Controller
{

    public function store(Request $request): JsonResponse
    {
        $this->validate($request, [
            'texto' => ['required', 'max:255'],
            'id_ticket' => ['required', 'exists:tickets,id']
        ]);

        // Almacenar resultados
        $comentario = Comentario::create([
            'texto' => $request->texto,
            'user_id' => Auth::id(),
            'id_ticket' => $request->id_ticket,
        ]);

        return response()->json([
            'message' => 'Comentario Agregado Exitosamente',
            'data' => $comentario,
        ]);
    }
}
