<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Ticket;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class WhatsAppController extends Controller
{
    
    private function conteoTemplate($nombre_cliente, $numero_ticket, $prendas, $fecha_entrega)
    {
        $template = "Hola buenas tardes Sr(a) *{$nombre_cliente}* nos comunicamos de Acqua Lavanderías 🐘🧼.\n";

        $template .= "Muchas gracias por su confianza, el conteo de sus prendas recibidas con el ticket *# {$numero_ticket}* es:\n\n";
        
        $prendasString = $this->getPrendasArrayToString($prendas);
        $template .= $prendasString;

        $dateFromString = date_create($fecha_entrega);
        $fechaFormateada = date_format($dateFromString, 'd-m-y H:i');
        
        $template .= "\nLe recordamos que la entrega está programada para el día *{$fechaFormateada}*, en caso de estar listo antes nos comunicaremos por este medio. \n";
        
        $template .= "Deseamos que tenga un excelente día.  👋🏽🐘✨ \n\n";
        
        $template .= '#AcquaLavanderías';

        return $template;
    }


    private function entregaTemplate($numero_ticket)
    {
        $template = "Estamos felices 😊☺ por comunicarle que su servicio de lavandería con el Ticket No. *{$numero_ticket}*, se encuentra listo para su entrega✅✅.\n\n";
        $template .= "En caso de no haber considerado el servicio de entrega a domicilio y lo necesita, con gusto podemos programarlo.\n";
        $template .= "Le recordamos que nuestro horario de servicio es: \n";
        
        $template .= "L a V --- 9am - 8pm\n";
        $template .= "S ------- 9am - 3pm.\n\n";
        
        $template .= "Que tenga un excelente día, y agradecemos su preferencia.\nBendiciones\n";

        return $template;
    }

    private function getPrendasArrayToString($prendas): string
    {
        $result = '';
        $contadorPrendas = 0;

        foreach ($prendas as $prenda) {
            $contadorPrendas += $prenda['total_inicial'];

            $nombrePrenda = $prenda['prenda']->nombre;
            $conteolPrendas = $prenda['total_inicial'];
            $result .= "{$nombrePrenda}: *{$conteolPrendas}*\n";
        }

        $finalString = "Piezas: *{$contadorPrendas}*\n\n";
        $finalString .= $result;
        return $finalString;
    }

    public function sendInitialWhatsAppTemplate(Request $r)
    {
        $r->validate([
            'ticket_id' => ['required', 'exists:tickets,id']
        ]);

        $numero_ticket = $r->ticket_id;
        $ticket = Ticket::where('id', $numero_ticket)->first();
        if (!$ticket) {
            return response()->json('Ticket no encontrado', 404);
        }
        $cliente = Cliente::where('id', $ticket->id_cliente)->first();
        if (!$cliente) {
            return response()->json('Cliente no encontrado', 404);
        }

        $twilioSid = env('TWILIO_SID');
        $twilioToken = env('TWILIO_AUTH_TOKEN');

        // $numeroCliente = $cliente->telefono;
        $numeroCliente = '9611003141';
        $recipientNumber = "+521{$numeroCliente}";

        try {
            $twilio = new Client($twilioSid, $twilioToken);
            $templateSid = env('TWILIO_MENSAJE_BIENVENIDA_TEMPLATE_SID');
            $messagingServiceId = env('TWILIO_WHATSAPP_MESSAGING_SERVICE_SID');

            $twilio->messages->create(
                "whatsapp:{$recipientNumber}",
                [
                    'contentSid' => $templateSid,
                    'from' => $messagingServiceId,
                ]
            );

            return response()->json(['message' => 'WhatsApp message sent successfully']);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json($e->getMessage(), 500);
        }
    }

    public function mensajeConteo(Request $r)
    {
        $r->validate([
            'ticket_id' => ['required', 'exists:tickets,id'],
        ]);

        $numero_ticket = $r->ticket_id;

        $ticket = Ticket::where('id', $numero_ticket)->with('prendasTicket.prenda')->first();

        if (!$ticket) {
            return response()->json('Ticket no encontrado', 404);
        }

        $prendas = $ticket->prendasTicket;
        $fecha_entrega = $ticket->fecha_entrega;

        $cliente = Cliente::where('id', $ticket->id_cliente)->first();

        if (!$cliente) {
            return response()->json('Cliente no encontrado', 404);
        }

        $nombre_cliente = $cliente->nombre;

        $twilioSid = env('TWILIO_SID');
        $twilioToken = env('TWILIO_AUTH_TOKEN');

        $numeroCliente = $cliente->telefono;
        $recipientNumber = "+521{$numeroCliente}"; // Replace with the recipient's phone number in WhatsApp format (e.g., "whatsapp:+1234567890")

        $twilio = new Client($twilioSid, $twilioToken);
        $whatsappSender = env('TWILIO_WHATSAPP_NUMBER');
        $messagingServiceId = env('TWILIO_WHATSAPP_MESSAGING_SERVICE_SID');

        $body = $this->conteoTemplate(
            $nombre_cliente,
            $numero_ticket,
            $prendas,
            $fecha_entrega
        );

        try {
            $twilio->messages->create(
                "whatsapp:{$recipientNumber}",
                [
                    'from' => "whatsapp:$whatsappSender",
                    'body' => $body,
                    'messagingServiceSid' => $messagingServiceId
                ]
            );

            return response()->json(['message' => 'WhatsApp message sent successfully']);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function mensajeEntrega(Request $r)
    {
        $r->validate([
            'ticket_id' => ['required', 'exists:tickets,id'],
        ]);

        $numero_ticket = $r->ticket_id;

        $ticket = Ticket::where('id', $numero_ticket)->first();

        if (!$ticket) {
            return response()->json('Ticket no encontrado', 404);
        }

        $cliente = Cliente::where('id', $ticket->id_cliente)->first();

        if (!$cliente) {
            return response()->json('Cliente no encontrado', 404);
        }

        $twilioSid = env('TWILIO_SID');
        $twilioToken = env('TWILIO_AUTH_TOKEN');

        $numeroCliente = $cliente->telefono;
        $recipientNumber = "+521{$numeroCliente}"; // Replace with the recipient's phone number in WhatsApp format (e.g., "whatsapp:+1234567890")

        $twilio = new Client($twilioSid, $twilioToken);
        $whatsappSender = env('TWILIO_WHATSAPP_NUMBER');
        $messagingServiceId = env('TWILIO_WHATSAPP_MESSAGING_SERVICE_SID');

        $body = $this->entregaTemplate($numero_ticket);

        try {
            $twilio->messages->create(
                "whatsapp:{$recipientNumber}",
                [
                    'from' => "whatsapp:$whatsappSender",
                    'body' => $body,
                    'messagingServiceSid' => $messagingServiceId
                ]
            );

            return response()->json(['message' => 'WhatsApp message sent successfully']);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
