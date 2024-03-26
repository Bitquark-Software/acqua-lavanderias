<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Ticket;
use App\Models\CorteCaja;
use App\Models\CodigoAdmin;
use App\Models\AnticipoTicket;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFound;
use Illuminate\Validation\ValidationException;

class CorteCajaController extends Controller
{

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
     * Almacena una nueva caja en la base de datos.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     *
     * @throws \Illuminate\Validation\ValidationException Si la validación falla.
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si el código de administrador no se encuentra.
     *
     * @api
     * @method POST
     * @route /ruta/a/tu/controlador
     *
     * @bodyParam id_sucursal integer required ID de la sucursal. Example: 1
     * @bodyParam monto_apertura numeric required Monto de apertura para la caja. Example: 100.00
     * @bodyParam codigoadmin string required Código de administrador para autorizar la operación. Example: 'ABC123'
     *
     * @response 201 {
     *   "mensaje": "Apertura de caja exitosa",
     *   "data": {
     *     "id": 1,
     *     "fecha_inicio": "2024-03-20 13:46:02",
     *     "abierto": true,
     *     "monto_apertura": 100.00,
     *     "id_sucursal": 1,
     *     "id_user": 1
     *   }
     * }
     *
     * @response 403 {
     *   "mensaje": "Codigo de cancelacion no valido o no Existe"
     * }
     *
     * @response 409 {
     *   "mensaje": "Ya existe una caja abierta"
     * }
     */
    public function store(Request $request)
    {
        // Antes de crear verificar si hay un codigo
        $request->validate([
            'id_sucursal' => ['required', 'integer', 'exists:sucursales,id'],
            'monto_apertura' => ['required', 'numeric'],
            'codigoadmin' => ['required']
        ]);

        $consultaCajasExistentes = CorteCaja::where('id_sucursal', $request->id_sucursal)
            ->where('abierto', true)
            ->exists();

        if ($consultaCajasExistentes) {
            return response()->json([
                'mensaje' => 'Ya existe una caja abierta para esta sucursal'
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
                'id_user' => $request->user()->id,
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
     * Actualiza una caja existente en la base de datos.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id El ID de la caja a actualizar.
     * @return \Illuminate\Http\Response
     *
     * @throws \Illuminate\Validation\ValidationException Si la validación falla.
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si la caja con el ID proporcionado no se encuentra.
     *
     * @api
     * @method PUT
     * @route /ruta/a/tu/controlador/{id}
     *
     * @bodyParam monto_cierre numeric required El monto de cierre para la caja. Example: 200.00
     * @bodyParam codigoadmin string optional El código de administrador para autorizar la operación. Example: 'ABC123'
     *
     * @response 200 {
     *   "mensaje": "Caja cerrada correctamente"
     * }
     *
     * @response 403 {
     *   "mensaje": "Codigo de cancelacion no valido o no Existe"
     * }
     *
     * @response 404 {
     *   "mensaje": "La caja con el ID proporcionado no se encontró"
     * }
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            "monto_cierre" => ['required', 'numeric'],
            'codigoadmin' => ['nullable']
        ]);

        try {
            $cajaActual = CorteCaja::findOrFail($id);
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'La caja con el ID proporcionado no se encontró'
            ], 404);
        }

        $fechaActual = date('Y-m-d H:m:s');
        $idSucursal = $cajaActual->id_sucursal;

        $datos = [
            'idCajaAbierta' => $cajaActual->id,
            'idSucursal' => $idSucursal
        ];

        // Creo una nueva instancia de Request y le paso los datos
        $nuevoRequest = new Request($datos);

        try {
            // Consultamos el metodo que trae el efectivo, transferencia, tarjeta
            $dineroGenerado = $this->ventaGeneral($nuevoRequest)->getData(true);
        } catch (\Exception $e) {
            // Manejar el error aquí. Por ejemplo, podrías registrar el error y devolver una respuesta con un mensaje de error.
            Log::error('Error al generar las ganancias de la caja(Sucursal): ' . $e->getMessage());
            return response()->json([
                'mensaje' => 'Hubo un error al buscar llamar las ganancias.' . $e
            ], 500);
        }

        // Verifica si el monto cierre es menor al de apertura
        if ($request->monto_cierre < ($cajaActual->monto_apertura)) {
            $respuesta = $this->usoAdminCode($request, $fechaActual);

            // todo: aqui ira el llamado del metodo para anticipos_envios

            if ($respuesta->status() !== 200) {
                return response()->json([
                    'mensaje' => $respuesta->content()
                ], $respuesta->status());
            }
        }

        // hacer el put a esta sucursal
        $cajaActual->update([
            'fecha_fin' => $fechaActual,
            'abierto' => false,
            'efectivo' => $dineroGenerado['efectivo'],
            'transferencia' => $dineroGenerado['transferencia'],
            'tarjeta' => $dineroGenerado['tarjeta'],
            'monto_cierre' => $request->monto_cierre,
            'monto_total' => $dineroGenerado['montoTotal']
        ]);

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
            'codigoadmin' => ['nullable']
        ]);

        if (empty($request->codigoadmin)) {
            return response()->json([
                'mensaje' => 'Es necesario un codigo administrador para eliminar una caja existente'
            ]);
        }

        $fechaActual = date("Y-m-d H:i:s");

        try {
            $caja = CorteCaja::find($id);
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'Caja no encontrada con el ID ingresado'
            ], 404);
        }

        if ($caja->fecha_fin) {
            return response()->json([
                'mensaje' => 'No se puede eliminar una caja que ya esta cerrada'
            ]);
        }

        $respuesta = $this->usoAdminCode($request, $fechaActual);

        if ($respuesta->status() !== 200) {
            return response()->json([
                'mensaje' => $respuesta->content()
            ], $respuesta->status());
        }

        $caja->delete();

        return response()->json([
            'mensaje' => 'Caja eliminada correctamente'
        ], 204);
    }

    /**
     * Este método verifica y actualiza un código de administrador.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $fechaActual La fecha y hora actual.
     *
     * @throws \Illuminate\Validation\ValidationException Si el código de administrador no se proporciona en la solicitud.
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si el código de administrador proporcionado no se encuentra en la base de datos.
     *
     * @return \Illuminate\Http\Response
     */
    public function usoAdminCode($request, $fechaActual)
    {
        if (empty($request->codigoadmin)) {
            return response('Es necesario un codigo de cierre de caja, monto cierre menor a monto apertura', 400);
        }

        try {
            $codigo = CodigoAdmin::where('codigo', $request->codigoadmin)->firstOrFail();

            if ($codigo->usado) {
                return response('Codigo Usado', 400);
            }

            $codigo->update([
                'usado' => true,
                'used_at' => $fechaActual,
                'id_user' => $request->user()->id
            ]);

            return response('Codigo Utilizado', 200);
        } catch (ModelNotFound $e) {
            return response('Codigo de cancelacion no valido o no Existe', 403);
        }
    }

    /**
     * Continuación de la función reportGenVent.
     *
     * Esta función calcula los totales de los tickets por método de pago (efectivo, transferencia, tarjeta) y los devuelve en un objeto JSON.
     * También calcula el monto total sumando los totales de cada método de pago.
     * Si ocurre un error durante el cálculo de los totales, la función devuelve un mensaje de error en un objeto JSON.
     * a axcepcion de los reportes este solo calcula los totales por sucursal
     * 
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Exception Si hay un error al calcular los totales.
     */
    public function ventaGeneral(Request $request)
    {
        $request->validate([
            'idCajaAbierta' => ['required', 'exists:corte_cajas,id'],
            'idSucursal' => ['required', 'exists:sucursales,id'],
        ]);

        $caja = CorteCaja::where('id', $request->idCajaAbierta)->first();

        $inicioFechaConsulta = $caja->fecha_inicio;
        $finFechaConsulta = date('Y-m-d H:m:s');
        $idSucursal = $request->idSucursal;

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

            $ticketsNucleo = Ticket::whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
                ->where('tickets.id_sucursal', $idSucursal)
                ->where('tickets.vencido', false)
                ->with(['cliente:id,nombre', 'anticipos'])
                ->get();

            $anticipoTickets = [];

            foreach ($ticketsNucleo as $ticket) {
                foreach ($ticket->anticipos as $anticipos) {
                    if ($anticipos) {
                        $anticipos->cobrado_por = !empty($anticipos->cobrado_por) ? User::find($anticipos->cobrado_por)->name : null;
                        if (!empty($anticipos->numero_referencia)) {
                            $anticipos->numero_referencia = Crypt::decrypt($anticipos->numero_referencia);

                            // Esto sirve para mostrar solo los ultimos tres digitos de numero_referencia
                            $longitud = strlen($anticipos->numero_referencia);
                            if ($longitud >= 3) {
                                $ultimosTresCaracteres = substr($anticipos->numero_referencia, -3);
                                $anticipos->numero_referencia = str_repeat('*', $longitud - 3) . $ultimosTresCaracteres;
                            }
                        } else {
                            $anticipos->numero_referencia;
                        }

                        $anticipoTickets[] = [
                            'id' => $ticket->id,
                            'tipo_credito' => $ticket->tipo_credito,
                            'vencido' => $ticket->vencido,
                            'total' => $ticket->total,
                            'nombre' => $ticket->cliente->nombre,
                            'metodopago' => $anticipos->metodopago,
                            'numero_referencia' => $anticipos->numero_referencia,
                            'anticipo' => $anticipos->anticipo,
                            'restante' => $anticipos->restante,
                            'cobrado_por' => $anticipos->cobrado_por,
                        ];
                    }
                }
            }

            $anticiposProcesados = collect($anticipoTickets);

            $efectivoCredPendiente = $anticiposProcesados->where('restante', '>', 0)
                ->where('tipo_credito', 'CREDITO')
                ->where('metodopago', 'EFECTIVO')
                ->sum('anticipo');

            $efectivoCredPagado = $anticiposProcesados->where('restante', 0)
                ->where('tipo_credito', 'CREDITO')
                ->where('metodopago', 'EFECTIVO')
                ->sum('anticipo');

            $efectivo = $anticiposProcesados->where('tipo_credito', 'CONTADO')
                ->where('metodopago', 'EFECTIVO')
                ->sum('total');

            $transferencia = $anticiposProcesados->where('tipo_credito', 'CONTADO')
                ->where('metodopago', 'TRANSFERENCIA')
                ->sum('total');

            $transferenciaAnticipos = $anticiposProcesados->where('restante', '>', 0)
                ->where('tipo_credito', 'CONTADO')
                ->where('metodopago', 'TRANSFERENCIA')
                ->sum('anticipo');

            $transferenciaAnticiposX = $anticiposProcesados->where('restante', '>=', 0)
                ->where('tipo_credito', 'CREDITO')
                ->where('metodopago', 'TRANSFERENCIA')
                ->sum('anticipo');

            $tarjeta = $anticiposProcesados->where('tipo_credito', 'CONTADO')
                ->where('metodopago', 'TARJETA')
                ->sum('total');

            $tarjetaAnticipos = $anticiposProcesados->where('restante', '>=', 0)
                ->whereIn('tipo_credito', ['CONTADO', 'CREDITO'])
                ->where('metodopago', 'TARJETA')
                ->sum('anticipo');
            
            $efectivoT = (float) round($efectivo + $efectivoCredPendiente + $efectivoCredPagado, 2);
            $transferenciaT = (float) round($transferencia + $transferenciaAnticipos + $transferenciaAnticiposX, 2);
            $tarjetaT = (float) round($tarjeta + $tarjetaAnticipos, 2);
            $montoTotal = (float) round($efectivoT + $transferenciaT + $tarjetaT, 2);

            return response()->json([
                'tickets' => $anticiposProcesados,
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

    // todo: esta funcion necesita la tabla anticipos_envios
    public function totalesCalcEnvios($inicioFechaConsulta, $finFechaConsulta)
    {

        if (empty($inicioFechaConsulta) && empty($finFechaConsulta)) {
            // Fecha Inicio y Final no Proporcinadas
            $inicioFechaConsulta = Carbon::now()->startOfDay();
            $finFechaConsulta = Carbon::now()->endOfDay();
        } else {
            /// Fechas Proporcinadas
            $inicioFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', $inicioFechaConsulta)->startOfDay();
            $finFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', $finFechaConsulta)->endOfDay();
        }

        $ticketsNucleo = Ticket::whereBetween('created_at', [$inicioFechaConsulta, $finFechaConsulta])
            ->where('tickets.envio_domicilio', true)
            ->with(['cliente:id,nombre', 'anticipoEnvio'])
            ->get();

        $anticiposEnvios = [];

        foreach ($ticketsNucleo as $ticket) {
            foreach ($ticket->anticipoEnvio as $anticipoEnvio) {
                if ($anticipoEnvio) {
                    $anticipoEnvio->cobrado_por = !empty($anticipoEnvio->cobrado_por) ? User::find($anticipoEnvio->cobrado_por)->name : null;
                    if (!empty($anticipoEnvio->numero_referencia)) {
                        $anticipoEnvio->numero_referencia = Crypt::decrypt($anticipoEnvio->numero_referencia);

                        // Esto sirve para mostrar solo los ultimos tres digitos de numero_referencia
                        $longitud = strlen($anticipoEnvio->numero_referencia);
                        if ($longitud >= 3) {
                            $ultimosTresCaracteres = substr($anticipoEnvio->numero_referencia, -3);
                            $anticipoEnvio->numero_referencia = str_repeat('*', $longitud - 3) . $ultimosTresCaracteres;
                        }
                    } else {
                        $anticipoEnvio->numero_referencia;
                    }

                    $anticiposEnvios[] = [
                        'id' => $ticket->id,
                        'tipo_credito' => $ticket->tipo_credito,
                        'vencido' => $ticket->vencido,
                        'costo_envio' => $ticket->costo_envio,
                        'nombre' => $ticket->cliente->nombre,
                        'metodopago' => $anticipoEnvio->metodopago,
                        'numero_referencia' => $anticipoEnvio->numero_referencia,
                        'anticipo' => $anticipoEnvio->anticipo,
                        'restante' => $anticipoEnvio->restante,
                        'cobrado_por' => $anticipoEnvio->cobrado_por,
                    ];
                }
            }
        }

        // Convierto los resultados en una coleccion
        $anticiposCollection = collect($anticiposEnvios);

        dd($anticiposCollection);

        $efectivoCredPendiente = $anticiposCollection->where('restante', '>', 0)
            ->where('tipo_credito', 'CREDITO')
            ->where('metodopago', 'EFECTIVO')
            ->where('vencido', false)
            ->sum('anticipo');

        $efectivoCredPagado = $anticiposCollection->where('restante', 0)
            ->where('tipo_credito', 'CREDITO')
            ->where('metodopago', 'EFECTIVO')
            ->where('vencido', false)
            ->sum('anticipo');

        $efectivo = $anticiposCollection->where('tipo_credito', 'CONTADO')
            ->where('metodopago', 'EFECTIVO')
            ->where('vencido', false)
            ->sum('costo_envio');

        $transferencia = $anticiposCollection->where('tipo_credito', 'CONTADO')
            ->where('metodopago', 'TRANSFERENCIA')
            ->where('vencido', false)
            ->sum('costo_envio');

        $transferenciaAnticipos = $anticiposCollection->where('restante', '>', 0)
            ->where('tipo_credito', 'CONTADO')
            ->where('metodopago', 'TRANSFERENCIA')
            ->where('tickets.vencido', false)
            ->sum('anticipo');

        $transferenciaAnticiposX = $anticiposCollection->where('restante', '>=', 0)
            ->where('tipo_credito', 'CREDITO')
            ->where('metodopago', 'TRANSFERENCIA')
            ->where('vencido', false)
            ->sum('anticipo');

        $tarjeta = $anticiposCollection->where('tipo_credito', 'CONTADO')
            ->where('metodopago', 'TARJETA')
            ->where('vencido', false)
            ->sum('costo_envio');

        $tarjetaAnticipos = $anticiposCollection->where('restante', '>', 0)
            ->whereIn('tipo_credito', ['CONTADO', 'CREDITO'])
            ->where('metodopago', 'TARJETA')
            ->where('vencido', false)
            ->sum('anticipo');

        $efectivoT = (float) round($efectivo + $efectivoCredPendiente + $efectivoCredPagado, 2);
        $transferenciaT = (float) round($transferencia + $transferenciaAnticipos + $transferenciaAnticiposX, 2);
        $tarjetaT = (float) round($tarjeta + $tarjetaAnticipos, 2);
        $montoTotal = (float) round($efectivoT + $transferenciaT + $tarjetaT, 2);

        return response()->json([
            'tickets' => $anticiposCollection,
            'efectivo' => $efectivoT,
            'transferencia' => $transferenciaT,
            'tarjeta' => $tarjetaT,
            'montoTotal' => $montoTotal
        ]);
    }
}
