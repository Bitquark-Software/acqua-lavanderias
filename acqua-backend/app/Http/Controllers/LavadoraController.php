<?php

namespace App\Http\Controllers;

use App\Models\Lavadora;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class LavadoraController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Lavadora::paginate(8);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request) : JsonResponse
    {
        // Obtener el último ID de registro de la tabla de lavadoras
        $ultimoId = Lavadora::max('id');

        // Incrementar el último ID para obtener el siguiente ID
        $siguienteId = $ultimoId + 1;

        // Crear el nombre de la lavadora concatenando el valor por defecto con el siguiente ID
        $nombreLavadora = 'DEFAULT LAVADORA ' . $siguienteId;

        $request->validate([ // No es requerido por que tiene un nombre por default
            'nombre' => ['string', 'max:80']
        ]);

        $lavadora = Lavadora::create([
            'nombre' => Str::upper($request->input('nombre', $nombreLavadora))
        ]);

        return response()->json([
            'mensaje' => 'Lavadora agregada correctamente',
            'data' => $lavadora
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Lavadora::find($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id) : JsonResponse
    {
        $request->validate([
            'nombre' => ['string', 'max:80']
        ]);

        $lavadora = Lavadora::findOrFail($id);
        $lavadora->update([
            'nombre' => Str::upper($request->nombre)
        ]);

        return response()->json([
            'mensaje' => 'Lavadora actualizada con éxito'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id) : JsonResponse
    {
        $lavadora = Lavadora::findOrFail($id);
        $lavadora->delete();

        return response()->json(['mensaje' => 'Lavadora eliminada correctamente'], 204);
    }
}
