<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProcesoTicketsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('proceso_tickets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_ticket');
            $table->unsignedBigInteger('id_proceso');
            $table->dateTime('timestamp_start')->nullable();
            $table->dateTime('timestamp_end')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('id_lavadora')->nullable();
            $table->unsignedBigInteger('id_secadora')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('id_ticket')->references('id')->on('tickets');
            $table->foreign('id_proceso')->references('id')->on('procesos');
            $table->foreign('id_lavadora')->references('id')->on('lavadoras');
            $table->foreign('id_secadora')->references('id')->on('secadoras');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('proceso_tickets');
    }
}
