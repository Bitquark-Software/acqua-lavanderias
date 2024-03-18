<?php

namespace App\Http\Controllers;

use App\Models\CorteCaja;
use App\Models\CodigoAdmin;

use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFound;
use Illuminate\Http\Request;

class CorteCajaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return CorteCaja::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Antes de crear verificar si hay un codigo
        $request->validate([
            'id_sucursal' => ['required', 'integer', 'exists:sucursales,id'],
            'id_user' => ['required', 'integer', 'exists:users,id'],
            'monto_apertura' => ['required', 'numeric'],
            'codigoadmin' => ['required']
        ]);

        try {
            $codigo = CodigoAdmin::where('codigo', $request->codigoadmin)->firstOrFail();

            if ($codigo->usado) {
                return response()->json([
                    'mensaje' => 'Codigo usado'
                ]);
            }

            $fechaActual = date('Y-m-d H:m-s');

            $cajaApertura = CorteCaja::create([
                'fecha_inicio' => $fechaActual,
                'id_sucursal' => $request->id_sucursal,
                'id_user' => $request->id_user,
                'monto_apertura' => $request->monto_apertura
            ]);

            return response()->json([
                'mensaje' => 'Apertura de caja exitosa',
                'data' => $cajaApertura
            ], 201);
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'Codigo de cancelacion no valido o no Existe'
            ], 403);
        }
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return CorteCaja::with('sucursal')->find($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        /*
            'fecha_fin' => 'nullable|date_format:Y-m-d H:i:s', // ! NO INCLUIR
            'abierto' => 'required|boolean', // ! NO INCLUIR
            'efectivo' => 'required|numeric|min:0', // ! AL CREAR NO INCLUIR
            'transferencia' => 'required|numeric|min:0', // ! AL CREAR NO INCLUIR
            'tarjeta' => 'required|numeric|min:0', // ! AL CREAR NO INCLUIR
            'monto_total' => 'required|numeric|min:0', // ! AL CREAR NO INCLUIR
        */

        $request->validate([
            'fecha_fin' => ['nullable', 'date_format:Y-m-d H:i:s'],
            'abierto' => ['nullable', 'boolean'],
            'efectivo' => ['required_if:abierto,false', 'numeric', 'min:0'],
            'transferencia' => ['required_if:abierto,false', 'numeric', 'min:0'],
            'tarjeta' => ['required_if:abierto,false', 'numeric', 'min:0'],
            'monto_total' => ['required_if:abierto,false', 'numeric', 'min:0']
        ]);

        // Verificar si abierto viene false
            // -> Si viene false Usar o Crear una funcion similar a reportGenVent
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
