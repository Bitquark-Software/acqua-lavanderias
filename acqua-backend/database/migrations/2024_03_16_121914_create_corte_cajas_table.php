<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCorteCajasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('corte_cajas', function (Blueprint $table) {
            $table->id();
            $table->dateTime('fecha_inicio')->nullable();
            $table->dateTime('fecha_fin')->nullable();
            $table->boolean('abierto')->default(true);
            $table->decimal('monto_apertura', 8, 2)->default(0.00);
            $table->decimal('efectivo', 8, 2)->default(0.00);
            $table->decimal('transferencia', 8, 2)->default(0.00);
            $table->decimal('tarjeta', 8, 2)->default(0.00);
            $table->decimal('monto_total', 10, 2)->default(0.00);
            $table->decimal('monto_cierre', 10, 2)->nullable();

            $table->unsignedBigInteger('id_sucursal');
            $table->unsignedBigInteger('id_user');

            // Restricciones de las llaves foráneas
            $table->foreign('id_sucursal')->references('id')->on('sucursales');
            $table->foreign('id_user')->references('id')->on('users');

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
        Schema::dropIfExists('corte_cajas');
    }
}
