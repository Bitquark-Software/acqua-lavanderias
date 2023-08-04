<?php

namespace App\Http\Controllers;

use App\Models\Proceso;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class ProcesoController extends Controller
{
    public function index()
    {
        return Proceso::all();
    }

    public function store(Request $request) : JsonResponse
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:80']
        ]);

        $proceso = Proceso::create([
            'nombre' => Str::upper($request->nombre)
        ]);

        return response()->json([
            'mensaje' => 'Proceso creado con exito',
            'data' => $proceso
        ]);
    }
}
