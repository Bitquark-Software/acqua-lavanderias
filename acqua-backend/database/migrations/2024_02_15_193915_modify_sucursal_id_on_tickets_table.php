<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifySucursalIdOnTicketsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropForeign(['id_direccion']); // Elimina la antigua restricción de clave foránea
            $table->foreign('id_direccion')->references('id')->on('direcciones')->onDelete('set null');

            $table->dropForeign(['id_sucursal']);
            $table->foreign('id_sucursal')->references('id')->on('sucursales')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropForeign(['id_direccion']); // Elimina la nueva restricción de clave foránea
            $table->foreign('id_direccion')->references('id')->on('direcciones');

            $table->dropForeign(['id_sucursal']); // Elimina la nueva restricción de clave foránea
            $table->foreign('id_sucursal')->references('id')->on('sucursales');
        });
    }
}
