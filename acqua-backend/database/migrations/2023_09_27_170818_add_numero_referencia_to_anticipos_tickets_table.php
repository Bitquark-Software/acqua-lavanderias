<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNumeroReferenciaToAnticiposTicketsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('anticipo_tickets', function (Blueprint $table) {
            $table->string('numero_referencia')->nullable();
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
            $table->dropColumn('numero_referencia');
        });
    }
}
