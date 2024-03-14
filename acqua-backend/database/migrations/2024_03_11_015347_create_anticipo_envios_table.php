<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAnticipoEnviosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('anticipo_envios', function (Blueprint $table) {
            $table->id();
            $table->decimal('anticipo', 10, 2)->default(0.00); 
            $table->enum('metodopago', ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']);
            $table->unsignedBigInteger('id_ticket');
            $table->integer('cobrado_por');
            $table->string('numero_referencia')->nullable();
            $table->decimal('restante', 10, 2)->default(0.00);

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
        Schema::dropIfExists('anticipo_envios');
    }
}
