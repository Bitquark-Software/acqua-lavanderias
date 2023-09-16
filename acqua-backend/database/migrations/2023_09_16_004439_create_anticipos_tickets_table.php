<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAnticiposTicketsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('anticipo_tickets', function (Blueprint $table) {
            $table->id();
            $table->decimal('anticipo', 10, 2);
            $table->enum('metodopago', ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']);
            $table->unsignedBigInteger('id_ticket');
            $table->integer('cobrado_por'); // ID del usuario Logueado

            $table->foreign('id_ticket')->references('id')->on('tickets');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('anticipos_tickets');
    }
}
