<?php

namespace App\Http\Controllers;

use App\Models\CodigoAdmin;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFound;
use Illuminate\Http\JsonResponse;

class CodigoAdminController extends Controller
{

    private function generacionCodigoUnico(): string
    {
        do {
            $codigoGenerado = Str::random(8);
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
            ], 201);
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

        $verificacionUsadoCodigo = CodigoAdmin::where('usado', '=', 0)->exists();

        if ($verificacionUsadoCodigo) {
            return response()->json([
                'mensaje' => 'Ya existe un codigo, no es posible generar otro'
            ], 422);
        }

        $codigoGenerado = $this->generacionCodigoUnico();

        if ($request->id_ticket !== null) {
            $fecha_actual = date("Y-m-d H:i:s");
        }

        // En caso de que el codigo sea para un ticket el admin puede pasarle directamente el ticket
        $ticketUsado = isset($request->id_ticket) ? true : false;

        $codigo = CodigoAdmin::create([
            'codigo' => $codigoGenerado,
            'motivo' => $request->motivo,
            'usado' => $ticketUsado,
            'id_ticket' => $request->input('id_ticket'),
            'id_user' => $request->user()->id,
            'used_at' => $fecha_actual ?? null
        ]);

        return response()->json([
            'mensaje' => 'Codigo cancelacion ticket generado',
            'data' => $codigo
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\CancelacionCodigo  $cancelacionCodigo
     * @return \Illuminate\Http\Response
     */
    public function show(CodigoAdmin $cancelacionCodigo)
    {
        return CodigoAdmin::with('ticket')->findOrFail($cancelacionCodigo);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\CancelacionCodigo  $cancelacionCodigo
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, CodigoAdmin $cancelacionCodigo)
    {
        $request->validate([
            'id_ticket' => ['nullable', 'exists:tickets,id']
        ]);

        $fecha_actual = date("d-m-Y H:i:s");

        try {

            $codigoCancelacion = CodigoAdmin::findOrFail($cancelacionCodigo);
            $codigoCancelacion->update([
                'usado' => true,
                'id_ticket' => $request->id_ticket,
                'used_at' => $fecha_actual
            ]);

            return response()->json([
                'mensaje' => 'Codigo utilizado correctamente',
                'data' => $codigoCancelacion
            ]);
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'El código de cancelación no existe'
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\CancelacionCodigo  $cancelacionCodigo
     * @return \Illuminate\Http\Response
     */
    public function destroy(CodigoAdmin $cancelacionCodigo): JsonResponse
    {
        try {
            $codigoCancelacion = CodigoAdmin::findOrFail($cancelacionCodigo);

            if ($codigoCancelacion->usado === true || isset($codigoCancelacion->id_ticket)) {
                return response()->json([
                    'mensaje' => 'Codigo de Cancelacion usado o Vinculado a un ticket'
                ]);
            }

            $codigoCancelacion->delete();

            return response()->json([
                'mensaje' => 'Codigo de Cancelacion Eliminado'
            ], 204);
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'El código de cancelación no existe'
            ], 404);
        }
    }
}
