<?php

namespace App\Http\Controllers;

use App\Models\CodigoAdmin;
use App\Models\Ticket;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFound;
use Illuminate\Http\JsonResponse;

class CodigoAdminController extends Controller
{

    private function generacionCodigoUnico(): string
    {
        do {
            $letrasPermitidas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            $letrasAleatorias = substr(str_shuffle($letrasPermitidas), 0, 4);

            $numeros = rand(1000, 9999);
            $codigoGenerado = $letrasAleatorias . $numeros;
        } while (CodigoAdmin::where('codigo', $codigoGenerado)->exists());

        return $codigoGenerado;
    }

    public function buscarCodigo(Request $request)
    {
        $request->validate([
            'codigo' => 'required',
        ]);

        $usuarioActual = $request->user()->id;

        $codigo = CodigoAdmin::where('codigo', $request->codigo)
            ->where('id_user', $usuarioActual)
            ->where('usado', false)
            ->first();

        if ($codigo) {
            return response()->json([
                'mensaje' => 'Código encontrado',
                'codigo' => $codigo,
            ], 200);
        } else {
            return response()->json([
                'mensaje' => 'Código no encontrado o ya ha sido usado',
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
        return CodigoAdmin::paginate(15);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'id_ticket' => ['nullable', 'exists:tickets,id'],
            'motivo' => ['required', 'string']
        ]);

        // Verifica que no exista un codigo que todavia no este usado
        $verificacionUsadoCodigo = CodigoAdmin::where('usado', '=', 0)->exists();

        if ($verificacionUsadoCodigo) {
            return response()->json([
                'mensaje' => 'Ya existe un codigo, no es posible generar otro'
            ], 422);
        }

        $codigoGenerado = $this->generacionCodigoUnico();

        // En caso de que el codigo sea para un ticket el admin puede pasarle directamente el ticket
        $ticketUsado = isset($request->id_ticket) ? true : false;
        $fecha_actual = null;

        if ($ticketUsado) {
            // traigo el ticket si en dado caso el codigo es para eso
            try {
                $ticket = Ticket::find($request->id_ticket);
            } catch (ModelNotFound $e) {
                return response()->json([
                    'mensaje' => 'ticket para cancelacion no encontrado'
                ]);
            }

            if ($ticketUsado) {
                $ticket->delete();

                $fecha_actual = date("Y-m-d H:i:s");
            }
        }

        $codigo = CodigoAdmin::create([
            'codigo' => Str::upper($codigoGenerado),
            'motivo' => Str::upper($request->motivo),
            'usado' => $ticketUsado,
            'id_ticket' => $request->input('id_ticket'),
            'id_user' => $request->user()->id,
            'used_at' => $fecha_actual ?? null
        ]);

        $mensajePersonalizadoAdmin = $fecha_actual ? 'Ticket eliminado correctamente, codigoadmin usado correctamente' :
                'Codigo administrador generado exitosamente';

        return response()->json([
            'mensaje' => $mensajePersonalizadoAdmin,
            'data' => $codigo
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\CancelacionCodigo  $cancelacionCodigo
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return CodigoAdmin::find($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\CancelacionCodigo  $cancelacionCodigo
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'id_ticket' => ['nullable', 'exists:tickets,id']
        ]);

        $fecha_actual = date("Y-m-d H:i:s");

        try {

            $codigoCancelacion = CodigoAdmin::findOrFail($id);
            $codigoCancelacion->update([
                'usado' => true,
                'id_ticket' => $request->id_ticket ?? null,
                'used_at' => $fecha_actual
            ]);

            return response()->json([
                'mensaje' => 'Codigo utilizado correctamente',
                'data' => $codigoCancelacion
            ]);
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'El código de administrador no existe'
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\CancelacionCodigo  $cancelacionCodigo
     * @return \Illuminate\Http\Response
     */
    public function destroy($id): JsonResponse
    {
        // Solo se elimina cuando no se ha usado el Codigo
        try {
            $codigoCancelacion = CodigoAdmin::findOrFail($id);

            if ($codigoCancelacion->usado || !isset($codigoCancelacion->id_ticket)) {
                return response()->json([
                    'mensaje' => 'Codigo de administrador usado o Vinculado a un ticket'
                ], 422);
            }

            $codigoCancelacion->delete();

            return response()->json([
                'mensaje' => 'Codigo de administrador Eliminado'
            ], 204);
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'El código de administrador no existe'
            ], 404);
        }
    }
}
