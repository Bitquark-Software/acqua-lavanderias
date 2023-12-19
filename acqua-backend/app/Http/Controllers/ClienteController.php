<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class ClienteController extends Controller
{

    /**
     * *Buscar un cliente por su nombre.
     *
     * @param  string  $nombre
     * @return \Illuminate\Http\Response
     */
    public function buscarPorNombre(Request $request) : JsonResponse
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
    public function buscarPorTelefono(Request $request) : JsonResponse
    {
        $request->validate([
            'telefono' => ['string','not_regex:/[^0-9\-]/']
        ]);

        $telefono = trim($request->input('telefono'));

        $clientes = Cliente::where('telefono', 'LIKE', '%' . $telefono . '%')->get();

        if ($clientes) {
            return response()->json([
                'clientes' => $clientes
            ], 200);
        } else {
            return response()->json([
                'mensaje' => 'Clientes no encontrados'
            ], 404);
        }
    }

    /**
     * *Buscar un cliente por su número telefónico.
     *
     * @param string $fecha_inicio
     * @param string $fecha_fin
     * @return \Illuminate\Http\Response
     */
    public function statsClientes(Request $request) : JsonResponse
    {

        $request->validate([
            'fecha_inicio' => ['date_format:Y-m-d H:i:s', 'nullable'],
            'fecha_fin' => ['date_format:Y-m-d H:i:s',  'nullable', 'after_or_equal:fecha_inicio'],
        ]);

        $inicioFechaConsulta = $request->fecha_inicio;
        $finFechaConsulta = $request->fecha_fin;

        try {
            if (empty($inicioFechaConsulta) && empty($finFechaConsulta)) {
                // Fecha Inicio y Final no Proporcinadas
                $inicioFechaConsulta = Carbon::now()->startOfDay();
                $finFechaConsulta = Carbon::now()->endOfDay();
            } else {
                /// Fechas Proporcinada
                $inicioFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_inicio'))->startOfDay();
                $finFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_fin'))->endOfDay();
            }

            // Consulta para numero de Clientes Nuevos
            $numClientesNuevos = Cliente::whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->get()
                ->count();

            // Regresa los registros(Clientes) que se encuentre entre esos periodos
            $ClientesNuevos = Cliente::whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->get();

            return response()->json([
                'clientesNuevos' => $numClientesNuevos,
                'clientes' => $ClientesNuevos
            ]);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'mensaje' => $e->getMessage(),
                ],
                500
            );
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
    public function store(Request $request) : JsonResponse
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:clientes'],
            'telefono' => ['required', 'string', 'max:15', 'not_regex:/[^0-9\-]/'],
            'id_sucursal' => ['nullable', 'exists:sucursales,id']
        ]);

        $cliente = Cliente::create([
            'nombre' => Str::title($request->nombre),
            'email' => $request->email,
            'telefono' => $request->telefono,
            'id_sucursal' => $request->id_sucursal
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
        return Cliente::with('direccion', 'sucursal')->find($id);
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
            'nombre' => ['required', 'string', 'max:255'],
            'email' => ['nullable'],
            'telefono' => ['required', 'string', 'max:15', 'not_regex:/[^0-9\-]/'],
            'id_sucursal' => ['nullable', 'exists:sucursales,id']
        ]);

        $cliente = Cliente::findOrFail($id);
        $cliente->update([
            'nombre' => Str::title($request->nombre),
            'email' => $request->email,
            'telefono' => $request->telefono,
            'id_sucursal' => $request->id_sucursal
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
    public function destroy(Request $request, $id) : JsonResponse
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
