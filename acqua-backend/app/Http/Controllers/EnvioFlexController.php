<?php

namespace App\Http\Controllers;

use App\Models\AnticipoEnvio;
use App\Models\Direccion;
use App\Models\EnvioFlex;
use App\Models\ProcesoEnvio;
use App\Models\Ticket;
use App\Models\Sucursal;

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

        try {
            $ticket = Ticket::where('id', $request->id_ticket)->firstOrFail();
        } catch (ModelNotFound $e) {
            return response()->json(['mensaje' => 'Ticket no encontrado'], 404);
        }

        $estatusTicket = ['CREADO','LAVADO', 'SECADO', 'PLANCHADO', 'RECONTEO'];

        if(in_array($ticket->status, $estatusTicket)) {
            return response()->json([
                'mensaje' => 'No es posible generar otro proceso de envio para este ticket debido a su status'
            ], 422);
        }

        // Verificar proceso Actual
        try {
            $procesoEnvio = ProcesoEnvio::where('id', $request->id_proceso_envios)->firstOrFail();
        } catch (ModelNotFound $e) {
            return response()->json(['mensaje' => 'Proceso no encontrado'], 404);
        }

        // Verificamos si existe un proceso de Envio
        $existeProceso = EnvioFlex::where('id_ticket', $request->id_ticket)
            ->where('id_proceso_envios', $request->id_proceso_envios)->first();

        if ($existeProceso) {
            return response()->json([
                'mensaje' => 'Proceso envio existente'
            ], 409);
        }

        if ($procesoEnvio->nombre === 'ENVIO/ENTREGA') {

            if ($ticket->envio_domicilio || $request->envio_domicilio) {
                $registrosDeAnticipos = AnticipoEnvio::where('id_ticket', $request->id_ticket)
                    ->latest('id')
                    ->first();

                $existeDireccion = Direccion::where('cliente_id', $ticket->id_cliente)
                    ->where('activo', true)
                    ->exists();

                if (!$existeDireccion) {
                    return response()->json([
                        'mensaje' => 'El cliente no cuenta con una direccion de envio'
                    ], 422);
                }

                // Verifica si el pago de envio ya se realiso
                if ($registrosDeAnticipos->restante > 0) {
                    return response()->json([
                        'mensaje' => 'Falta pago de Envio',
                        'data' => $registrosDeAnticipos->restante
                    ], 422);
                }
            }
            // Recoleccion en Sucursal
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
        return EnvioFlex::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'sucursal' => ['nullable'],
            'resivido' => ['nullable', 'boolean'],
            'entregado' => ['nullable', 'boolean']
        ]);

        $envioFlexible = EnvioFlex::findOrFail($id);

        if (!empty($request->sucursal)) {
            $sucursal = Sucursal::where('id', $request->sucursal)->exists();
            if (!$sucursal) {
                return response()->json([
                    'mensaje' => 'Id sucursal no encontrada'
                ], 404);
            }

            $envioFlexible->update([
                'id_sucursal' => $request->sucursal
            ]);
        }

        if (!empty($request->resivido) && !empty($request->entregado)) {
            return response()->json([
                'mensaje' => 'Solo debe proporcionar al menos uno de los campos "resivido" o "entregado"'
            ], 422);
        }

        $fechaYHoraActual = date('Y-m-d H-m-s');

        if (!empty($request->resivido)) {
            $envioFlexible->update([
                'resivido' => $request->resivido,
                'fecha_reubicacion' => $fechaYHoraActual,
                'id_user' => $request->user()->id
            ]);
        }

        if (!empty($request->entregado)) {
            $envioFlexible->update([
                'entregado' => $request->entregado,
                'fecha_resivido' => $fechaYHoraActual,
                'id_user' => $request->user()->id
            ]);
        }

        return response()->json([
            'mensaje' => 'Proceso envio actualizado'
        ], 200);
    }
}
