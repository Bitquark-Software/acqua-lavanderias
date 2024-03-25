<?php

namespace App\Http\Controllers;

use App\Models\Proceso;
use App\Models\ProcesoEnvio;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFound;

class ProcesoEnvioController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return ProcesoEnvio::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:50']
        ]);

        $procesoEnvio = ProcesoEnvio::create([
            'nombre' => Str::upper($request->nombre)
        ]);

        return response()->json([
            'mensaje' => 'Proceso envio creado correctamente',
            'data' => $procesoEnvio
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            return Proceso::findOrFail($id);
        } catch (ModelNotFound $e) {
            return response()->json(['error' => 'Proceso no encontrado'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:50']
        ]);

        $procesoEnvio = ProcesoEnvio::findOrFail($id);
        $procesoEnvio->update([
            'nombre' => Str::upper($request->nombre)
        ]);

        return response()->json([
            'mensaje' => 'Proceso envio actualizado'
        ], 200);
    }
}
