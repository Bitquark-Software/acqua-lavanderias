<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Ticket;
use App\Models\CorteCaja;
use App\Models\CodigoAdmin;
use App\Models\AnticipoTicket;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFound;
use Illuminate\Validation\ValidationException;

class CorteCajaController extends Controller
{

    // ! AQUI VA EL METODO PARA CALCULAR LOS INGRESOS DE LA CAJA

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return CorteCaja::with('sucursal')->orderBy('created_at', 'desc')->paginate(15);
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

        $consultaCajasExistentes = CorteCaja::where('id_sucursal', $request->id_sucursal)->exists();

        if ($consultaCajasExistentes) {
            return response()->json([
                'mensaje' => 'Ya existe una caja abierta'
            ], 409);
        }

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

            $codigo->update([
                'usado' => true,
                'used_at' => $fechaActual,
                'id_user' => $request->user()->id
            ]);

            Log::info('Abrio la caja el usuario' . $request->user()->id);
            Log::info('Con id de caja' . $cajaApertura->id);

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
        $request->validate([
            "monto_cierre" => ['required', 'numeric'],
            'codigoadmin' => ['nullable']
        ]);

        // Validar si el monto cierre es menor a monto apertura
        try {
            $cajaActual = CorteCaja::findOrFail($id);
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'La caja con el ID proporcionado no se encontró'
            ], 404);
        }

        $fechaActual = date('Y-m-d H:m:s');
        $fechaApertura = $cajaActual->fecha_inicio;
        $idSucursal = $cajaActual->id_sucursal;

        DB::transaction(function () use ($request, $fechaActual, $cajaActual, $fechaApertura, $idSucursal) {
            if ($request->monto_cierre < $cajaActual->monto_apertura) {
                $this->usoAdminCode($request, $fechaActual);
            }

            // Consultamos el metodo que trae el efectivo, transferencia, tarjeta
            $dineroGenerado = $this->reportGenVent($fechaApertura, $fechaActual, $idSucursal)->getData(true);

            // hacer el put a esta sucursal
            $cajaActual->update([
                'fecha_fin' => $fechaActual,
                'abierto' => false,
                'efectivo' => $dineroGenerado['efectivo'],
                'transferencia' => $dineroGenerado['transferencia'],
                'tarjeta' => $dineroGenerado['tarjeta'],
                'monto_cierre' => $request->monto_cierre + $dineroGenerado['montoTotal'],
                'monto_total' => $dineroGenerado['montoTotal']
            ]);
        });

        Log::info('Cerro la caja el usuario con id - ' . $request->user()->id);

        return response()->json([
            'mensaje' => 'Caja cerrada correctamente'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $request->validate([
            'codigoadmin' => ['required']
        ]);

        $fechaActual = date("Y-m-d H:i:s");

        try {
            $caja = CorteCaja::find($id);
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'Caja no encontrada con el ID ingresado'
            ], 404);
        }

        $this->usoAdminCode($request, $fechaActual); // ! VERIFICAR SI RETORNA LAS RESPUESTAS ERRORES

        $caja->delete();

        return response()->json([
            'mensaje' => 'Caja eliminada correctamente'
        ], 204);
    }

    public function usoAdminCode($request, $fechaActual)
    {
        if (!$request->codigoadmin) {
            return response()->json([
                'mensaje' => 'Es necesario un codigo de cierre de caja, monto cierre menor a monto apertura'
            ], 400);
        }

        try {
            $codigo = CodigoAdmin::where('codigo', $request->codigoadmin)->firstOrFail();

            if ($codigo->usado) {
                return response()->json([
                    'mensaje' => 'Codigo usado'
                ], 400);
            }

            $codigo->update([
                'usado' => true,
                'used_at' => $fechaActual,
                'id_user' => $request->user()->id
            ]);
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'Codigo de cancelacion no valido o no Existe'
            ], 403);
        }
    }

    public function reportGenVent($inicioFechaConsulta, $finFechaConsulta, $idSucursal)
    {
        try {
            if (empty($inicioFechaConsulta) && empty($finFechaConsulta)) {
                // Fecha Inicio y Final no Proporcinadas
                $inicioFechaConsulta = Carbon::now()->startOfDay();
                $finFechaConsulta = Carbon::now()->endOfDay();
            } else {
                /// Fechas Proporcinadas
                $inicioFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', $inicioFechaConsulta)->startOfDay();
                $finFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', $finFechaConsulta)->endOfDay();
            }

            $tickets = Ticket::join('clientes', 'clientes.id', '=', 'tickets.id_cliente')
                ->join('anticipo_tickets', 'anticipo_tickets.id_ticket', '=', 'tickets.id')
                ->select(
                    'tickets.id',
                    'anticipo_tickets.metodopago',
                    'anticipo_tickets.numero_referencia',
                    'tickets.total',
                    'anticipo_tickets.anticipo',
                    'anticipo_tickets.restante',
                    'clientes.nombre',
                    'anticipo_tickets.cobrado_por'
                )
                ->where('tickets.id_sucursal', $idSucursal)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->distinct('anticipo_tickets.id_ticket')
                ->get();

            // Desencriptar la referencia y agregarla al array $tickets
            foreach ($tickets as $ticket) {
                $ticket->cobrado_por = !empty($ticket->cobrado_por) ? User::find($ticket->cobrado_por)->name : null;

                if (!empty($ticket->numero_referencia)) {
                    $ticket->numero_referencia = Crypt::decrypt($ticket->numero_referencia);

                    // Esto sirve para mostrar solo los ultimos tres digitos de numero_referencia
                    $longitud = strlen($ticket->numero_referencia);
                    if ($longitud >= 3) {
                        $ultimosTresCaracteres = substr($ticket->numero_referencia, -3);
                        $ticket->numero_referencia = str_repeat('*', $longitud - 3) . $ultimosTresCaracteres;
                    }
                } else {
                    $ticket->numero_referencia;
                }
            }

            $efectivoCredPendiente = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.id_sucursal', $idSucursal)
                ->where('anticipo_tickets.restante', '>', 0)
                ->where('tickets.tipo_credito', 'CREDITO')
                ->where('anticipo_tickets.metodopago', 'EFECTIVO')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $efectivoCredPagado = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.id_sucursal', $idSucursal)
                ->where('anticipo_tickets.restante', 0)
                ->where('tickets.tipo_credito', 'CREDITO')
                ->where('anticipo_tickets.metodopago', 'EFECTIVO')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $efectivo = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.id_sucursal', $idSucursal)
                ->where('tickets.tipo_credito', 'CONTADO')
                ->where('anticipo_tickets.metodopago', 'EFECTIVO')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('tickets.total');

            $transferencia = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.id_sucursal', $idSucursal)
                ->where('tickets.tipo_credito', 'CONTADO')
                ->where('anticipo_tickets.metodopago', 'TRANSFERENCIA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('tickets.total');

            $transferenciaAnticipos = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.id_sucursal', $idSucursal)
                ->where('anticipo_tickets.restante', '>', 0)
                ->where('tickets.tipo_credito', 'CONTADO')
                ->where('anticipo_tickets.metodopago', 'TRANSFERENCIA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $transferenciaAnticiposX = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.id_sucursal', $idSucursal)
                ->where('anticipo_tickets.restante', '>=', 0)
                ->where('tickets.tipo_credito', 'CREDITO')
                ->where('anticipo_tickets.metodopago', 'TRANSFERENCIA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $tarjeta = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.id_sucursal', $idSucursal)
                ->where('tickets.tipo_credito', 'CONTADO')
                ->where('anticipo_tickets.metodopago', 'TARJETA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('tickets.total');

            $tarjetaAnticipos = AnticipoTicket::join('tickets', 'tickets.id', '=', 'anticipo_tickets.id_ticket')
                ->where('tickets.id_sucursal', $idSucursal)
                ->where('anticipo_tickets.restante', '>', 0)
                ->whereIn('tickets.tipo_credito', ['CONTADO', 'CREDITO'])
                ->where('anticipo_tickets.metodopago', 'TARJETA')
                ->where('tickets.vencido', false)
                ->whereBetween('tickets.created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->sum('anticipo_tickets.anticipo');

            $efectivoT = (float) round($efectivo + $efectivoCredPendiente + $efectivoCredPagado, 2);
            $transferenciaT = (float) round($transferencia + $transferenciaAnticipos + $transferenciaAnticiposX, 2);
            $tarjetaT = (float) round($tarjeta + $tarjetaAnticipos, 2);
            $montoTotal = (float) round($efectivoT + $transferenciaT + $tarjetaT, 2);

            return response()->json([
                'tickets' => $tickets,
                'efectivo' => $efectivoT,
                'transferencia' => $transferenciaT,
                'tarjeta' => $tarjetaT,
                'montoTotal' => $montoTotal
            ]);
        } catch (\Exception $e) {
            // Fecha no valida
            return response()->json(
                [
                    'mensaje' => $e->getMessage()
                ],
                500
            );
        }
    }
}
