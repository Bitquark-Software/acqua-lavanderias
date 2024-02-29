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
    
    private function conteoTemplate($nombre_cliente, $numero_ticket, $prendas, $fecha_entrega) {
        $template = "Hola buenas tardes Sr(a) *{$nombre_cliente}* nos comunicamos de Acqua Lavanderías 🐘🧼.\n";

        $template .= "Muchas gracias por su confianza, el conteo de sus prendas recibidas con el ticket *# {$numero_ticket}* es:\n";
        
        $prendasString = $this->getPrendasArrayToString($prendas);
        $template .= $prendasString;

        $dateFromString = date_create($fecha_entrega);
        $fechaFormateada = date_format($dateFromString, 'd-m-y');
        
        $template .= "Le recordamos que la entrega está programada para el día *{$fechaFormateada}*, en caso de estar listo antes nos comunicaremos por este medio. \n";
        
        $template .= "Deseamos que tenga un excelente día.  👋🏽🐘✨ \n";
        
        $template .= "#AcquaLavanderías";

        return $template;
    }

    private function entregaTemplate($numero_ticket) {
        // Message template SID (replace this with your approved template SID)
        $templateSid = 'HXd93e52542b78fd0bf3b9ee0003766601';

        // Template variables
        $templateData = array(
            '1' => $numero_ticket,
        );

        return [$templateSid, $templateData];
    }

    private function getPrendasArrayToString($prendas): string {
        $result = "";
        $contadorPrendas = 0;

        foreach($prendas as $prenda){
            //     "id": 14,
            //     "id_ticket": 43,
            //     "id_prenda": 5,
            //     "total_inicial": 3,
            //     "total_final": 3,
            //     "created_at": "2023-10-18T04:47:25.000000Z",
            //     "updated_at": "2023-10-18T23:34:35.000000Z",
            //     "prenda": {
            //         "id": 5,
            //         "nombre": "CALCETIN SUELTO",
            //         "created_at": "2023-09-05T23:44:36.000000Z",
            //         "updated_at": "2023-09-05T23:44:36.000000Z"
            //     }
            // }
            $contadorPrendas += $prenda['total_inicial'];

            $nombrePrenda = $prenda['prenda']->nombre;
            $conteolPrendas = $prenda['total_inicial'];
            $result .= "{$nombrePrenda}: *{$conteolPrendas}*\n";
        }

        $finalString = "Piezas: {$contadorPrendas}\n";
        $finalString .= $result;
        return $finalString;
    }

    public function mensajeConteo(Request $r) {
        $r->validate([
            'ticket_id' => ['required', 'exists:tickets,id'],
            'nombre_cliente' => ['required', 'string'],
        ]);

        $numero_ticket = $r->ticket_id;

        $ticket = Ticket::where('id', $numero_ticket)->with('prendasTicket.prenda')->first();

        if(!$ticket) {
            return response()->json("Ticket no encontrado", 404);
        }

        $prendas = $ticket->prendasTicket;
        $fecha_entrega = $ticket->fecha_entrega;

        $template = $this->conteoTemplate($r->nombre_cliente, $numero_ticket, $prendas, $fecha_entrega);


        $cliente = Cliente::where('id', $ticket->id_cliente)->first();

        $twilioSid = env('TWILIO_SID');
        $twilioToken = env('TWILIO_AUTH_TOKEN');
        $twilioWhatsAppNumber = env('TWILIO_WHATSAPP_NUMBER');

        $numeroCliente = $cliente->telefono;
        $recipientNumber = "+521{$numeroCliente}"; // Replace with the recipient's phone number in WhatsApp format (e.g., "whatsapp:+1234567890")

        $twilio = new Client($twilioSid, $twilioToken);

        try {
            $twilio->messages->create(
                "whatsapp:{$recipientNumber}",
                [
                    "from" => "whatsapp:{$twilioWhatsAppNumber}",
                    "body" => $template,
                ]
            );

            return response()->json(['message' => 'WhatsApp message sent successfully']);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function mensajeEntrega(Request $r) {
        $r->validate([
            'ticket_id' => ['required', 'exists:tickets,id'],
        ]);

        $numero_ticket = $r->ticket_id;

        $ticket = Ticket::where('id', $numero_ticket)->with('prendasTicket.prenda')->first();

        if(!$ticket) {
            return response()->json("Ticket no encontrado", 404);
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
                ->create("whatsapp:{$recipientNumber}",
                    [
                        "contentSid" => $template[0],
                        "from" => "$twilioWhatsAppNumber",
                        "contentVariables" => "'".json_encode($template[1])."'"
                    ]
                );

            return response()->json(['message' => 'WhatsApp message sent successfully']);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
