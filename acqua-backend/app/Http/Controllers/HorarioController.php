<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Horario;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class HorarioController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Horario::paginate(15);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Se esta usando una validacion Personalisada para las Horas en un formato de 24hr
        $request->validate([
            'sucursal_id' => ['required', 'integer', 'exists:sucursales,id'],
            'dias' => ['required', 'string', 'max:60'],
            'horario' => ['required', 'string', 'max:20', function ($attribute, $value, $fail) {
                if (!preg_match('/^([01][0-9]|2[0-3]):[0-5][0-9] a ([01][0-9]|2[0-3]):[0-5][0-9]$/', $value)) {
                    $fail($attribute . ' debe estar en el formato "HH:MM a HH:MM".');
                }
            }]
        ]);

        try {
            // Obtener Datos por ID sucursal
            $horariosSucursal = Horario::where('sucursal_id', '=', $request->sucursal_id)->get();
        } catch (\Exception $e) {
            echo 'Horario de la sucursal ingresada no encontrada',  $e->getMessage(), "\n";
        }

        $diasConversionMayuscula = Str::upper($request->dias);

        // Logica de Dias Permitidos a Ingresar
        $patronDias = '/^(LUNES|LUNES A VIERNES|LUNES A JUEVES|LUNES A MIERCOLES|LUNES A MARTES|LUNES A SABADO|LUNES A DOMINGO|MARTES|MARTES A VIERNES|MARTES A JUEVES|MARTES A 
            MIERCOLES|MARTES A SABADO|MARTES A DOMINGO|MIERCOLES|MIERCOLES A VIERNES|MIERCOLES A JUEVES|MIERCOLES A SABADO|MIERCOLES A DOMINGO|JUEVES|JUEVES A VIERNES|JUEVES A 
            SABADO|JUEVES A DOMINGO|VIERNES|VIERNES A SABADO|VIERNES A DOMINGO|SABADO|SABADO A DOMINGO|DOMINGO)$/i';

        if (!preg_match($patronDias, $diasConversionMayuscula)) {
            return response()->json([
                'mensaje' => 'Dias ingresados no cumplen con la sintaxis correspondiente'
            ], 400);
        }

        // Verifica si el dia ingresado ya existe
        foreach ($horariosSucursal as $horario) :
            if ($horario->dias === $diasConversionMayuscula) :
                return response()->json([
                    'mensaje' => 'Dia ingresado ya existe para esa sucursal'
                ], 404);
            endif;
        endforeach;

        $horario = Horario::create([
            'sucursal_id' => $request->sucursal_id,
            'dias' => $diasConversionMayuscula,
            'horario' => $request->horario
        ]);

        return response()->json([
            'mensaje' => 'Horario creado exitosamente',
            'data' => $horario
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
        return Horario::with('sucursal')->find($id);
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
        $horario = Horario::find($id);

        if (!$horario) {
            return response()->json([
                'mensaje' => 'Horario no encontrado'
            ], 404);
        }

        $request->validate([
            'sucursal_id' => ['required', 'integer', 'exists:sucursales,id'],
            'dias' => ['required', 'string', 'max:60'],
            'horario' => ['required', 'string', 'max:20', function ($attribute, $value, $fail) {
                if (!preg_match('/^([01][0-9]|2[0-3]):[0-5][0-9] a ([01][0-9]|2[0-3]):[0-5][0-9]$/', $value)) {
                    $fail($attribute . ' debe estar en el formato "HH:MM a HH:MM".');
                }
            }]
        ]);

        $diasConversionMayuscula = Str::upper($request->dias);

        // Logica de Dias Permitidos a Ingresar
        $patronDias = '/^(LUNES|LUNES A VIERNES|LUNES A JUEVES|LUNES A MIERCOLES|LUNES A MARTES|LUNES A SABADO|LUNES A DOMINGO|MARTES|MARTES A VIERNES|MARTES A JUEVES|MARTES A 
                MIERCOLES|MARTES A SABADO|MARTES A DOMINGO|MIERCOLES|MIERCOLES A VIERNES|MIERCOLES A JUEVES|MIERCOLES A SABADO|MIERCOLES A DOMINGO|JUEVES|JUEVES A VIERNES|JUEVES A 
                SABADO|JUEVES A DOMINGO|VIERNES|VIERNES A SABADO|VIERNES A DOMINGO|SABADO|SABADO A DOMINGO|DOMINGO)$/i';

        if (!preg_match($patronDias, $diasConversionMayuscula)) {
            return response()->json([
                'mensaje' => 'Dias ingresados no cumplen con la sintaxis correspondiente'
            ], 400);
        }

        // Actualiza los datos del horario
        $horario->update([
            'sucursal_id' => $request->sucursal_id,
            'dias' => $diasConversionMayuscula,
            'horario' => $request->horario
        ]);

        return response()->json([
            'mensaje' => 'Horario actualizado exitosamente',
            'data' => $horario
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id): JsonResponse
    {
        try {
            $horario = Horario::findOrFail($id);
            $horario->delete();

            return response()->json([
                'mensaje' => 'Horario eliminado correctamente'
            ], 204);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al eliminar el horario',
                'detalle' => $e->getMessage()
            ], 500);
        }
    }
}
