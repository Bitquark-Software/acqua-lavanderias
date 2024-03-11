<?php

namespace App\Http\Controllers;

use App\Models\EnvioFlex;
use App\Models\ProcesoEnvio;
use App\Models\Ticket;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFound;

class EnvioFlexController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return EnvioFlex::all();
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
            'id_proceso_envios' => ['required', 'exists:proceso_envios,id'],
            'id_sucursal' => ['required', 'exists:sucursales,id'],
            'id_ticket' => ['required', 'exists:tickets,id'],
            'envio_domicilio' => ['nullable', 'boolean']
        ]);

        // Traemos el Ticket
        $ticket = Ticket::where('id', $request->id_ticket)->firstOrFail();
        $procesoEnvio = ProcesoEnvio::where('id', $request->id_proceso_envios)->firstOrFail();

        dd($procesoEnvio);

        if (!$ticket) {
            return response()->json([
                'mensaje' => 'Ticket no encontrado'
            ], 422);
        }

        // Verificamos si existe un proceso de Envio
        $existeProceso = EnvioFlex::where('id_ticket', $request->id_ticket)
            ->where('id_proceso_envios', $request->id_proceso_envios)->first();

        if ($existeProceso) {
            return response()->json([
                'mensaje' => 'Proceso envio existente'
            ], 409);
        }

        // ! ANTICIPO_ENVIOS
        /*
            - Agregar anticipos o pagar todo el envio de un putaso
            - En el show mostrar los anticipos_envio y tickets relacionados
        */

        // ! VALIDACIONES ANTES DE INSERTAR DATOS CUANDO QUIERE ENVIO A DOMICILIO
        /*
            1 .- Verificar que id_proceso_envio es tiene que ser el 4
            2 .- Verificar si quiere envio o recoger en sucursal
            3 .- Antes de insertalo verificar si ya pago consultado anticipo_envios(Si no retornar respuesta)
            4 .- si ya pago proceder a insertar el registro con id_proceso envios 3 pero sin para el true de entregado
        */

        // ? Verificacion 1
        if ($procesoEnvio->nombre === 'ENVIO/ENTREGA') {

            if ($ticket->envio_domicilio || $request->envio_domicilio) {
                
            } else {
                // * RECOLECCION EN SUCURSAL
            }

        }
        // No es el proceso de ENVIO/ENTREGA

        $envioFlex = EnvioFlex::create([
            'id_proceso_envios' => $request->id_proceso_envios,
            'id_sucursal' => $request->id_sucursal,
            'id_ticket' => $request->id_ticket,
        ]);

        return response()->json([
            'mensaje' => 'Proceso envio generado exitosamente',
            'data' => $envioFlex
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Validacion
        // 'resivido' => ['nullable', 'boolean'], // ! NO NECESARIOS AQUI
        // 'entregado' => ['nullable', 'boolean'], // ! NO NECESARIOS AQUI

        // Al meter los datos
        // 'resivido' => $request->resivido ?? false, // ! NO NECESARIOS AQUI
        // 'entregado' => $request->entregado ?? false, // ! NO NECESARIOS AQUI

        // fecha_reubicacion
        // fecha_resivido
        // id_user
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\EnvioFlex  $envioFlex
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
    }
}
