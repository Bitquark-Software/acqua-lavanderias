<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEnvioFlexsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('envio_flexs', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('id_proceso_envios');
            $table->unsignedBigInteger('id_sucursal');
            $table->unsignedBigInteger('id_ticket');
            $table->boolean('resivido')->default(0);
            $table->timestamp('fecha_reubicacion')->nullable();
            $table->boolean('entregado')->default(0);
            $table->timestamp('fecha_resivido')->nullable();
            $table->unsignedBigInteger('id_user')->nullable();

            $table->foreign('id_sucursal')->references('id')->on('sucursales');
            $table->foreign('id_user')->references('id')->on('users');
            $table->foreign('id_proceso_envios')->references('id')->on('proceso_envios');
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
        Schema::dropIfExists('envio_flexs');
    }
}
