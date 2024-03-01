<?php

namespace App\Http\Controllers;

use App\Models\CancelacionCodigo;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFound;
use Illuminate\Http\JsonResponse;

class CancelacionCodigoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return CancelacionCodigo::paginate(15);
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
            'usado' => ['nullable', 'bool'],
            'id_ticket' => ['nullable', 'exists:tickets,id']
        ]);

        do { // Verifica que el codigo no se halla generado anteriormente

            $codigoGenerado = Str::random(6);
            $buscarCodigoSiExiste = CancelacionCodigo::where('codigo', $codigoGenerado)->first();
        } while ($buscarCodigoSiExiste === true);

        // Si se le pasa el ticket, poner el ticket como usado
        $ticketUsado = isset($request->id_ticket) ? true : false;

        $codigo = CancelacionCodigo::create([
            'codigo' => $codigoGenerado,
            'usado' => $ticketUsado,
            'id_ticket' => $request->input('id_ticket'),
        ]);

        return response()->json([
            'mensaje' => 'Codigo cancelacion ticket generado',
            'data' => $codigo
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\CancelacionCodigo  $cancelacionCodigo
     * @return \Illuminate\Http\Response
     */
    public function show(CancelacionCodigo $cancelacionCodigo)
    {
        return CancelacionCodigo::with('ticket')->findOrFail($cancelacionCodigo);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\CancelacionCodigo  $cancelacionCodigo
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, CancelacionCodigo $cancelacionCodigo)
    {
        $request->validate([
            'id_ticket' => ['required', 'exists:tickets,id']
        ]);

        $fecha_actual = date("d-m-Y H:i:s");

        try {

            $codigoCancelacion = CancelacionCodigo::findOrFail($cancelacionCodigo);
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
    public function destroy(CancelacionCodigo $cancelacionCodigo) : JsonResponse
    {
        try {
            $codigoCancelacion = CancelacionCodigo::findOrFail($cancelacionCodigo);

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
