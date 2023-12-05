<?php

namespace App\Http\Controllers;

use App\Models\Prenda;
use App\Models\ServicioTicket;
use App\Models\AnticipoTicket;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\ValidationException;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Ticket::with('cliente')->orderBy('created_at', 'desc')->paginate(1500);
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
            'id_cliente' => ['required', 'exists:clientes,id'],
            'envio_domicilio' => ['boolean'],
            'id_direccion' => ['nullable', 'exists:direcciones,id'],
            'id_sucursal' => ['nullable', 'exists:sucursales,id'],
            'incluye_iva' => ['boolean'],
            'tipo_credito' => ['required', 'in:CREDITO,CONTADO'],
            'metodo_pago' => ['required', 'in:EFECTIVO,TARJETA,TRANSFERENCIA'],
            'total' => ['required', 'numeric', 'min:0'],
            'anticipo' => ['numeric', 'min:0'],
            'servicios' => ['required', 'array'],
            'fecha_entrega' => ['nullable', 'date_format:Y-m-d H:i:s'],
            'numero_referencia' => ['nullable', 'string', 'max:19']
        ]);

        $anticipo = $request->tipo_credito === 'CREDITO' ? ($request->anticipo ?? 0.00) : 0.00;
        $restante = $request->tipo_credito === 'CREDITO' ? $request->total - $request->anticipo : 0.00;

        $valor = $request->metodo_pago;

        // Encyptacion de refencia
        $numeroTarjetaCifrado = !is_null($request->numero_referencia)
            ? Crypt::encrypt($request->numero_referencia)
            : null;

        // Ticket
        $ticket = Ticket::create([
            'id_cliente' => $request->id_cliente,
            'envio_domicilio' => $request->envio_domicilio ?? true,
            'id_direccion' => $request->id_direccion,
            'id_sucursal' => $request->id_sucursal,
            'incluye_iva' => $request->incluye_iva ?? false,
            'tipo_credito' => $request->tipo_credito,
            'metodo_pago' => $request->metodo_pago,
            'total' => $request->total,
            'anticipo' => $anticipo,
            'restante' => $restante,
            'fecha_entrega' => $request->fecha_entrega,
            'numero_referencia' => $numeroTarjetaCifrado
        ]);

        // Anticipos_Tickets
        if ($valor == 'TARJETA' || $valor == 'TRANSFERENCIA' || $valor == 'EFECTIVO') {
            $anticipo = AnticipoTicket::create([
                'anticipo' => $request->tipo_credito == 'CREDITO' ? $ticket->anticipo : $ticket->total,
                'metodopago' => $ticket->metodo_pago,
                'id_ticket' => $ticket->id,
                'cobrado_por' => $request->user()->id,
                'numero_referencia' => $numeroTarjetaCifrado,
                'restante' => $restante
            ]);
        }

        foreach ($request->servicios as $servicio) {
            ServicioTicket::create([
                'id_ticket'     => $ticket->id,
                'id_servicio'   => $servicio['id'],
                'kilos'         => $servicio['cantidad'],
            ]);
        }

        return response()->json([
            'mensaje' => 'Ticket creado exitosamente',
            'data' => Ticket::with(
                'cliente',
                'direccion',
                'sucursal',
                'comentarios',
                'serviciosTicket',
                'anticipos'
            )->find($ticket->id),
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
        // Retorna todas las relaciones Cliente, Direccion y Sucursal
        $ticket = Ticket::with('cliente.direccion', 'direccion', 'sucursal', 'comentarios','serviciosTicket', 'serviciosTicket.servicio', 'prendasTicket', 'procesosTicket')->find($id);

        // Verifica si el número de referencia está presente y desencripta si es necesario
        if (!is_null($ticket->numero_referencia)) {
            $ticket->numero_referencia = Crypt::decrypt($ticket->numero_referencia);
        }

        $ticket->comentarios->transform(function ($t) {
            $empleado = User::where('id', $t->user_id)->first();
            $t->sender = $empleado ? $empleado->name : 'UNKNOWN';
            $t->errorState = $empleado ? false : true;
            $t->date = Carbon::parse($t->created_at)->format('d/m/Y, h:m:s');
            return $t;
        });

        $ticket->prendasTicket->transform(function ($t) {
            $prenda = Prenda::where('id', $t->id_prenda)->first();
            $t->nombre = $prenda ? $prenda->nombre : 'UNKNOWN';
            return $t;
        });
        return $ticket;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'envio_domicilio' => ['boolean'],
            'id_direccion' => ['nullable', 'exists:direcciones,id'],
            'id_sucursal' => ['nullable', 'exists:sucursales,id'],
            'incluye_iva' => ['boolean'],
            'tipo_credito' => ['required', 'in:CREDITO,CONTADO'],
            'metodo_pago' => ['required', 'in:EFECTIVO,TARJETA,TRANSFERENCIA'],
            'total' => ['required', 'numeric', 'min:0'],
            'anticipo' => ['numeric', 'min:0'],
            'status' => ['in:CREADO,LAVADO,PLANCHADO,RECONTEO,SECADO,ENTREGA'],
            'vencido' => ['boolean'],
            'fecha_entrega' => ['nullable', 'date_format:Y-m-d H:i:s'],
            'numero_referencia' => ['nullable', 'string']
        ]);

        $anticipo = $request->tipo_credito === 'CREDITO' ? ($request->anticipo ?? 0.00) : 0.00;
        $restante = $request->tipo_credito === 'CREDITO' ? $request->total - $request->anticipo : 0.00;

        // Encyptacion de refencia
        $numeroTarjetaCifrado = !is_null($request->numero_referencia)
            ? Crypt::encrypt($request->numero_referencia)
            : null;

        $ticket = Ticket::findOrFail($id);
        $ticket->update([
            'envio_domicilio' => $request->envio_domicilio ?? true,
            'id_direccion' => $request->id_direccion,
            'id_sucursal' => $request->id_sucursal,
            'incluye_iva' => $request->incluye_iva ?? false,
            'tipo_credito' => $request->tipo_credito,
            'metodo_pago' => $request->metodo_pago,
            'total' => $request->total,
            'anticipo' => $anticipo,
            'restante' => $restante,
            'status' => $request->status ?? 'CREADO',
            'vencido' => $request->vencido ?? false,
            'fecha_entrega' => $request->fecha_entrega,
            'numero_referencia' => $numeroTarjetaCifrado
        ]);

        return response()->json([
            'mensaje' => 'Ticket actualizado',
            'data' => $ticket
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
        $ticket = Ticket::findOrFail($id);
        $ticket->comentarios()->delete();

        $ticket->delete();

        return response()->json([
            'mensaje' => 'Ticket eliminado correctamente'
        ], 204);
    }
}
