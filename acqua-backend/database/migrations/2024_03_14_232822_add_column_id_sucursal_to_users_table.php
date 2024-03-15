<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AddColumnIdSucursalToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            try {
                $idMatriz = DB::table('sucursales')->where('nombre', 'MATRIZ')->value('id');
            
                if ($idMatriz === null) {
                    throw new Exception('No se encontró la sucursal MATRIZ');
                } else {
                    $table->unsignedBigInteger('id_sucursal')->default($idMatriz);
                    $table->foreign('id_sucursal')->references('id')->on('sucursales');
                }
            } catch (Exception $e) {
                Log::error($e->getMessage());
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['id_sucursal']);
            $table->dropColumn('id_sucursal');
        });
    }
}
