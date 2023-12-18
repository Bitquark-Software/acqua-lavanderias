<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddValueRestanteToAnticipoTicketsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('anticipo_tickets', function (Blueprint $table) {
            // Obtener todos los registros de AnticipoTickets donde restante es 0.00
            $anticipoTickets = DB::table('anticipo_tickets')->where('restante', 0.00)->get();
        
            // Obtener todos los totales de los tickets de una sola vez (evitara demasiadas consultas de Eloquent)
            $totals = DB::table('tickets')->pluck('total', 'id');

            /* 
                Agrupar los anticipos por id_ticket
                Si hay tres registros con el mismo id_ticket los mete a un array con el valor del id del ticket como llave del array 
                y dentro serian como tal los tickets agrupados
            */ 
            $groupedAnticipoTickets = $anticipoTickets->groupBy('id_ticket');

            // id_ticket : ID del 'Ticket'
            // groupTickets: Registros de 'anticipo_tickets'
            foreach ($groupedAnticipoTickets as $id_ticket => $groupTickets) {
                // Obtener el total correspondiente de la tabla Tickets
                $total = $totals[$id_ticket];
            
                // Inicializar la suma de anticipos (tipo referencia)
                // En cada iteracion del ForEach principal se vuelve a inicializar en cero
                $suma = 0;
            
                // $groupTickets : Registro de 'anticipo_tickets'
                // $anticipoTicket : columnas de 'anticipo_tickets'
                foreach ($groupTickets as $anticipoTicket) {
                    // Sumar el anticipo al total de anticipos
                    $suma += $anticipoTicket->anticipo;
            
                    // Calcular el valor restante
                    $restante = $total - $suma;
            
                    // Actualizar el registro actual en AnticipoTickets
                    DB::table('anticipo_tickets')
                        ->where('id', $anticipoTicket->id)
                        ->update(['restante' => $restante]);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('anticipo_tickets', function (Blueprint $table) {
            //
        });
    }
}
