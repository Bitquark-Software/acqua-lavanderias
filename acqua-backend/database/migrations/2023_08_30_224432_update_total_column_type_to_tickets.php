<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UpdateTotalColumnTypeToTickets extends Migration
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
            $this->changeColumnType('tickets', 'total', 'DECIMAL(10,2)');
            $this->changeColumnType('tickets', 'restante', 'DECIMAL(10,2)');
            $this->changeColumnType('tickets', 'anticipo', 'DECIMAL(10,2)');
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
            $this->changeColumnType('tickets', 'total', 'DECIMAL(5,2)');
            $this->changeColumnType('tickets', 'restante', 'DECIMAL(5,2)');
            $this->changeColumnType('tickets', 'anticipo', 'DECIMAL(5,2)');
        });
    }
}
