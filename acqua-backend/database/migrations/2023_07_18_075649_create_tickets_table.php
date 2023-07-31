<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTicketsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();

            // Llaves Foraneas
            $table->unsignedBigInteger('id_cliente');
            $table->boolean('envio_domicilio')->default(true);
            $table->unsignedBigInteger('id_direccion')->nullable();
            $table->unsignedBigInteger('id_sucursal')->nullable();

            $table->boolean('incluye_iva')->default(false);
            $table->enum('tipo_credito', ['CREDITO', 'CONTADO']);
            $table->enum('metodo_pago', ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']);
            $table->decimal('total', 5, 2);
            $table->decimal('anticipo', 5, 2)->default(0.00);
            $table->decimal('restante', 5, 2)->nullable();
            $table->enum('status', ['CREADO', 'LAVADO', 'PLANCHADO', 'RECONTEO', 'ENTREGA'])->default('CREADO');

            // Restricciones de las llaves foráneas
            $table->foreign('id_cliente')->references('id')->on('clientes');
            $table->foreign('id_direccion')->references('id')->on('direcciones');
            $table->foreign('id_sucursal')->references('id')->on('sucursales');

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
        Schema::dropIfExists('tickets');
    }
}
