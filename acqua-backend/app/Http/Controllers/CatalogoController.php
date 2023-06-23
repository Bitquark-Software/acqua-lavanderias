<?php

namespace App\Http\Controllers;

use App\Models\Catalogo;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class CatalogoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Catalogo::paginate(5);
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
            'name' => ['required', 'string', 'max:255']
        ]);

        $catalogo = Catalogo::create([
            'name' => Str::upper($request->input('name')),
        ]);

        return response()->json([
            'message' => 'Catalogo creado exitosamente',
            'data' => $catalogo,
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
        return Catalogo::find($id);
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
            'name' => ['required', 'string', 'max:255']
        ]);

        $catalogo = Catalogo::findOrFail($id);
        $catalogo->update([
            'name' => Str::upper($request->input('name'))
        ]);

        return response()->json(['mensaje' => 'Catalogo Actualizado...'], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $catalogo = Catalogo::findOrFail($id);
        $catalogo->servicios()->delete();
        $catalogo->delete();

        return response()->json(['mensaje' => 'Catalogo eliminado correctamente'], 204);
    }
}
