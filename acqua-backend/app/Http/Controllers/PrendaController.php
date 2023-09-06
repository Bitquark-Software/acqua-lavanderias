<?php

namespace App\Http\Controllers;

use App\Models\Prenda;
use Illuminate\Database\QueryException;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class PrendaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Prenda::orderBy('nombre', 'ASC')->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'nombre' => ['required', 'string', 'max:80' ,'unique:prendas']
        ]);

        $prenda = Prenda::create([
            'nombre' => Str::upper($request->input('nombre'))
        ]);

        return response()->json([
            'mensaje' => 'Prenda agregada exitosamente',
            'data' => $prenda
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
        return Prenda::find($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $this->validate($request, [
            'nombre' => ['required', 'string', 'max:80']
        ]);

        $prenda = Prenda::findOrFail($id);

        // Verifica si el Nombre ya existe
        $verifi = Prenda::where('nombre', Str::upper($request->nombre))->exists();

        // Verificar si el nombre ha sido modificado y si ya existe en otro registro
        if ($prenda->nombre != $request->nombre && $verifi) {
            return response()->json(['error' => 'El nombre ya existe, debe ser unico.'], 422);
        }

        $prenda->update([
            'nombre' => Str::upper($request->nombre)
        ]);

        return response()->json([
            'mensaje' => 'Prenda actualizada correctamente'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $prenda = Prenda::findOrFail($id);
        $prenda->delete();

        return response()->json([
            'mensaje' => 'Prenda Eliminada Correctamente'
        ], 204);
    }
}
