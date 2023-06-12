<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateServiciosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('servicios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('catalogo_id');
            $table->string('clave_servicio')->unique();
            $table->string('nombre_servicio');
            $table->decimal('importe', 8, 2);
            $table->integer('cantidad_minima');
            $table->timestamps();
            $table->foreign('catalogo_id')->references('id')->on('catalogos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('servicios');
    }
}
