<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCancelacionCodigosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cancelacion_codigos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 8);
            $table->string('motivo');
            $table->boolean('usado')->default(false);
            $table->unsignedBigInteger('id_ticket')->nullable();
            $table->unsignedBigInteger('id_user')->nullable();

            $table->foreign('id_ticket')->references('id')->on('tickets')->onDelete('cascade');
            $table->foreign('id_user')->references('id')->on('users')->onDelete('set null');
            $table->timestamp('used_at')->nullable();
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
        Schema::dropIfExists('cancelacion_codigos');
    }
}
