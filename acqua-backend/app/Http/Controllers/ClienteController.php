<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClienteController extends Controller
{

    /**
     * *Buscar un cliente por su nombre.
     *
     * @param  string  $nombre
     * @return \Illuminate\Http\Response
     */
    public function buscarPorNombre(Request $request)
    {
        $request->validate([
            'nombre' => ['string', 'max:255']
        ]);

        $nombre = trim($request->nombre);
        $nombreCodificado = Str::title($nombre);

        $cliente = Cliente::where('nombre', 'LIKE', '%' . $nombreCodificado . '%')->get();

        if ($cliente) {
            return response()->json([
                'clientes' => $cliente
            ], 200);
        } else {
            Log::info('No encontrados');
            return response()->json([
                'mensaje' => 'Cliente no encontrado'
            ], 404);
        }
    }

    /**
     * *Buscar un cliente por su número telefónico.
     *
     * @param  string  $telefono
     * @return \Illuminate\Http\Response
     */
    public function buscarPorTelefono(Request $request)
    {
        $request->validate([
            'telefono' => ['string','not_regex:/[^0-9\-]/']
        ]);

        $telefono = trim($request->input('telefono'));

        $cliente = Cliente::where('telefono', $telefono)->first();

        if ($cliente) {
            return response()->json($cliente, 200);
        } else {
            return response()->json([
                'mensaje' => 'Cliente no encontrado'
            ], 404);
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Cliente::paginate(10);
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
            'nombre' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:clientes'],
            'telefono' => ['required', 'string', 'max:15', 'not_regex:/[^0-9\-]/']
        ]);

        $cliente = Cliente::create([
            'nombre' => Str::title($request->nombre),
            'email' => $request->email,
            'telefono' => $request->telefono
        ]);

        return response()->json([
            'mensaje' => 'Cliente Creado Exitosamente',
            'data' => $cliente,
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
        return Cliente::with('direccion')->find($id);
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
            'nombre' => ['required', 'string', 'max:255'],
            'email' => ['nullable'],
            'telefono' => ['required', 'string', 'max:15', 'not_regex:/[^0-9\-]/']
        ]);

        $cliente = Cliente::findOrFail($id);
        $cliente->update([
            'nombre' => Str::title($request->nombre),
            'email' => $request->email,
            'telefono' => $request->telefono
        ]);

        return response()->json([
            'mensaje' => 'Cliente Actualizado Correctamente...'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $auth = $request->user('api'); // Autenticar utilizando el middleware auth:api

        if ($auth && isset($auth['role']) && $auth['role'] === 'administrador') {
            $cliente = Cliente::findOrFail($id);
            $cliente->direccion()->delete();
            $cliente->delete();

            return response()->json(null, 204);
        } else {
            return response()->json([
                'mensaje' => 'Sin Autorizacion de Eliminar'
            ], 403);
        }
    }
}
