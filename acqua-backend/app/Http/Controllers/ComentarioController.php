<?php

namespace App\Http\Controllers;

use App\Models\Comentario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ComentarioController extends Controller
{

    public function store(Request $request): JsonResponse
    {
        $this->validate($request, [
            'texto' => ['required', 'max:255']
        ]);
        // Obtener el ID del usuario autenticado
        $user_id = Auth::id();
        // Obtener Rol de Usuario Autenticado
        $rol = Auth::user()->role;

        // Almacenar resultados
        $comentario = Comentario::create([
            'user_id' => $user_id,
            'texto' => $request->texto,
        ]);

        return response()->json([
            'message' => 'Comentario Agregado Exitosamente',
            'rol' => $rol,
            'data' => $comentario,
        ]);
    }
}
