<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class ServiciosController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Servicio::paginate(10);
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
            'catalogo_id' => ['required', 'exists:catalogos,id'],
            'clave_servicio' => ['required', 'string', 'unique:servicios,clave_servicio'],
            'nombre_servicio' => ['required', 'string'],
            'importe' => ['required', 'numeric', 'min:1'],
            'cantidad_minima' => ['required', 'min:1'],
        ]);

        // Generacion de Clave
        $entrada = $request->input('clave_servicio');
        $palabras = Str::upper($entrada);
        $palabras = explode(' ', $palabras);


        // Obtencion de la primera letra de cada palabra
        $iniciales = collect($palabras)->map(function ($palabra) {
            return Str::substr($palabra, 0, 1);
        });

        // Unir las iniciales en una sola cadena
        $clave = $iniciales->implode('');

        $servicio = Servicio::create([
            'catalogo_id' => $request->catalogo_id,
            'clave_servicio' => Str::upper($clave),
            'nombre_servicio' => Str::upper($request->nombre_servicio),
            'importe' => $request->importe,
            'cantidad_minima' => $request->cantidad_minima,
        ]);

        return response()->json([
            'mensaje' => 'Servicio Generado Exitosamente',
            'data' => $servicio,
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
        return Servicio::find($id);
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
            'catalogo_id' => ['required'],
            'nombre_servicio' => ['required', 'string'],
            'importe' => ['required', 'numeric', 'min:1'],
            'cantidad_minima' => ['required', 'min:1'],
        ]);

        $servicio = Servicio::findOrFail($id);
        $servicio->catalogo_id = $request->catalogo_id;
        $servicio->nombre_servicio = $request->nombre_servicio;
        $servicio->importe = $request->importe;
        $servicio->cantidad_minima = $request->cantidad_minima;
        $servicio->save();

        return response()->json([
            'messaje' => 'Servicio Actualizado...',
            'data' => $servicio,
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
        $servicios = Servicio::findOrFail($id);
        $servicios ->delete();
        
        return response()->json(['mensaje' => 'Servicio Eliminado Correctamente'], 204);
    }
}
