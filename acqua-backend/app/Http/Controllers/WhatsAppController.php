<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

class WhatsAppController extends Controller
{
    
    private function conteoTemplate($nombre_cliente, $numero_ticket, $prendas, $fecha_entrega)
    {
        $prendasString = $this->getPrendasArrayToString($prendas);

        $dateFromString = date_create($fecha_entrega);
        $fechaFormateada = date_format($dateFromString, 'd-m-y H:s');

        return [
            '1' => $nombre_cliente,
            '2' => $numero_ticket,
            '3' => json_encode($prendasString, JSON_UNESCAPED_LINE_TERMINATORS),
            '4' => $fechaFormateada,
        ];
    }

    private function entregaTemplate($numero_ticket)
    {
        // Message template SID (replace this with your approved template SID)
        $templateSid = 'HXd93e52542b78fd0bf3b9ee0003766601';

        // Template variables
        $templateData = array(
            '1' => $numero_ticket,
        );

        return [$templateSid, $templateData];
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

        $finalString = "Piezas: {$contadorPrendas}\n";
        $finalString .= $result;
        return $finalString;
    }

    public function mensajeConteo(Request $r)
    {
        $r->validate([
            'ticket_id' => ['required', 'exists:tickets,id'],
            'nombre_cliente' => ['required', 'string'],
        ]);

        $numero_ticket = $r->ticket_id;

        $ticket = Ticket::where('id', $numero_ticket)->with('prendasTicket.prenda')->first();

        if (!$ticket) {
            return response()->json('Ticket no encontrado', 404);
        }

        $prendas = $ticket->prendasTicket;
        $fecha_entrega = $ticket->fecha_entrega;

        $templateVariables = $this->conteoTemplate($r->nombre_cliente, $numero_ticket, $prendas, $fecha_entrega);


        $cliente = Cliente::where('id', $ticket->id_cliente)->first();

        $twilioSid = env('TWILIO_SID');
        $twilioToken = env('TWILIO_AUTH_TOKEN');

        $numeroCliente = $cliente->telefono;
        $recipientNumber = "+521{$numeroCliente}"; // Replace with the recipient's phone number in WhatsApp format (e.g., "whatsapp:+1234567890")

        $twilio = new Client($twilioSid, $twilioToken);
        $templateSid = env('TWILIO_CONTEO_PRENDAS_TEMPLATE_SID');
        $messagingServiceId = env('TWILIO_WHATSAPP_MESSAGING_SERVICE_SID');

        $contentVariables = json_encode($templateVariables);
        Log::info($contentVariables);

        try {
            $twilio->messages->create(
                "whatsapp:{$recipientNumber}",
                [
                    'contentSid' => $templateSid,
                    'from' => $messagingServiceId,
                    'contentVariables' => $contentVariables
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

        $ticket = Ticket::where('id', $numero_ticket)->with('prendasTicket.prenda')->first();

        if (!$ticket) {
            return response()->json('Ticket no encontrado', 404);
        }

        $template = $this->entregaTemplate($numero_ticket); // array, 0 => SID, 1=> variables


        $cliente = Cliente::where('id', $ticket->id_cliente)->first();

        $twilioSid = env('TWILIO_SID');
        $twilioToken = env('TWILIO_AUTH_TOKEN');
        $twilioWhatsAppNumber = env('TWILIO_WHATSAPP_SENDER_ID');

        $numeroCliente = $cliente->telefono;
        $recipientNumber = "+521{$numeroCliente}"; // Replace with the recipient's phone number in WhatsApp format (e.g., "whatsapp:+1234567890")

        $twilio = new Client($twilioSid, $twilioToken);

        Log::info($template[0]);
        Log::info($template[1]);
        Log::info(json_encode($template[1]));
        Log::info("'".json_encode($template[1])."'");

        try {
            $twilio->messages
                ->create(
                    "whatsapp:{$recipientNumber}",
                    [
                        'contentSid' => $template[0],
                        'from' => "$twilioWhatsAppNumber",
                        'contentVariables' => "'".json_encode($template[1])."'"
                    ]
                );

            return response()->json(['message' => 'WhatsApp message sent successfully']);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
