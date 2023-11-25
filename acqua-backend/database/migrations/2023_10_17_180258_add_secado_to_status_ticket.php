<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AddSecadoToStatusTicket extends Migration
{
    public function changeColumnType($table, $column, $newColumnType) {                
        DB::statement("ALTER TABLE $table CHANGE $column $column $newColumnType");
    } 
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tickets', function (Blueprint $table) {
            $this->changeColumnType('tickets', 'status', "enum('CREADO','LAVADO','SECADO','PLANCHADO','RECONTEO','ENTREGA') DEFAULT 'CREADO'");
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
            $this->changeColumnType('tickets', 'status', "enum('CREADO','LAVADO','SECADO','PLANCHADO','RECONTEO','ENTREGA')");
        });
    }
}
