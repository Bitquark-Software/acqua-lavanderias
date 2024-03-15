<?php

namespace App\Http\Controllers;

use App\Models\Sucursal;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class SucursalController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Sucursal::with('horarios')->paginate(10);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request) : JsonResponse
    {
        $request->validate([
            'nombre' => ['required','string', 'max:255']
        ]);

        $sucursal = Sucursal::create([
            'nombre' => Str::upper($request->input('nombre'))
        ]);

        return response()->json([
            'mensaje' => 'Sucursal Creada Exitosamente',
            'data' => $sucursal
        ],201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Sucursal::with('horarios')->find($id);
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
        $request->validate([
            'nombre' => ['required','string', 'max:255']
        ]);

        $sucursal = Sucursal::findOrFail($id);
        $sucursal->update([
            'nombre' => Str::upper($request->nombre)
        ]);

        return response()->json([
            'mensaje' => 'Sucursal Actualizada Correctamente...'
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
        $sucursal = Sucursal::findOrFail($id);
        $sucursal->delete();

        return response()->json(['mensaje' => 'Sucursal Eliminada Correctamente'], 204);
    }
}
