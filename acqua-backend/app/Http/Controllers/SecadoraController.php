<?php

namespace App\Http\Controllers;

use App\Models\Secadora;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class SecadoraController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Secadora::all();
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
        $ultimoId = Secadora::max('id');

        // Incrementar el último ID para obtener el siguiente ID
        $siguienteId = $ultimoId + 1;

        // Crear el nombre de la lavadora concatenando el valor por defecto con el siguiente ID
        $nombreSecadora = 'DEFAULT SECADORA ' . $siguienteId;

        $request->validate([ // No es requerido por que tiene un nombre por default
            'nombre' => ['string', 'max:80'],
            'id_sucursal' => ['nullable', 'exists:sucursales,id']
        ]);

        $secadora = Secadora::create([
            'nombre' => Str::upper($request->input('nombre', $nombreSecadora)),
            'id_sucursal' => $request->id_sucursal
        ]);

        return response()->json([
            'mensaje' => 'Secadora agregada correctamente',
            'data' => $secadora
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
        return Secadora::with('sucursal')->find($id);
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
            'nombre' => ['string', 'max:80'],
            'id_sucursal' => ['nullable', 'exists:sucursales,id']
        ]);

        $secadora = Secadora::findOrFail($id);
        $secadora->update([
            'nombre' => Str::upper($request->nombre),
            'id_sucursal' => $request->id_sucursal
        ]);

        return response()->json([
            'mensaje' => 'Secadora actualizada con exito'
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
        $secadora = Secadora::findOrFail($id);
        $secadora->delete();

        return response()->json([
            'mensaje' => 'Secadora eliminada correctamente'
        ], 204);
    }
}
