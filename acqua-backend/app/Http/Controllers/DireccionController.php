<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use App\Models\Direccion;
use Illuminate\Http\Request;

class DireccionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Direccion::where('activo', true)
            ->paginate(10);
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
            'calle' => ['required', 'string', 'max:255'],
            'numero' => ['required', 'string', 'max:10'],
            'colonia' => ['required', 'string', 'max:100'],
            'ciudad' => ['required', 'string', 'max:100'],
            'codigo_postal' => ['required', 'string', 'min:5', 'max:10'],
            'nombre_ubicacion' => ['required', 'string', 'max:255'],
            'cliente_id' => ['required', 'integer', 'exists:clientes,id']
        ]);

        $direccion = Direccion::create([
            'calle' => Str::upper($request->calle),
            'numero' => Str::upper($request->numero),
            'colonia' => Str::upper($request->colonia),
            'ciudad' => Str::upper($request->ciudad),
            'codigo_postal' => Str::upper($request->codigo_postal),
            'nombre_ubicacion' => Str::upper($request->nombre_ubicacion),
            'cliente_id' => $request->cliente_id,
            'activo' => true
        ]);

        return response()->json([
            'mensaje' => 'Direccion Guardada Exitosamente',
            'data' => $direccion,
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
        return Direccion::where('activo', true)
            ->find($id);
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
            'calle' => ['required', 'string', 'max:255'],
            'numero' => ['required', 'string', 'max:10'],
            'colonia' => ['required', 'string', 'max:100'],
            'ciudad' => ['required', 'string', 'max:100'],
            'codigo_postal' => ['required', 'string', 'min:5', 'max:10'],
            'nombre_ubicacion' => ['required', 'string', 'max:255'],
        ]);

        $direccion = Direccion::findOrFail($id);
        $direccion->update([
            'calle' => Str::upper($request->calle),
            'numero' => Str::upper($request->numero),
            'colonia' => Str::upper($request->colonia),
            'ciudad' => Str::upper($request->ciudad),
            'codigo_postal' => Str::upper($request->codigo_postal),
            'nombre_ubicacion' => Str::upper($request->nombre_ubicacion),
        ]);

        return response()->json([
            'mensaje' => 'Direccion Actualizada Correctamente'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $auth = $request->user('api');

        if ($auth && isset($auth['role']) && $auth['role'] === 'administrador') {
            $direccion = Direccion::findOrFail($id);
            $direccion->activo = false;
            $direccion->save();

            return response()->json(null, 204);
        } else {
            return response()->json([
                'mensaje' => 'Sin Autorizacion de Eliminar'
            ], 403);
        }
    }
}
