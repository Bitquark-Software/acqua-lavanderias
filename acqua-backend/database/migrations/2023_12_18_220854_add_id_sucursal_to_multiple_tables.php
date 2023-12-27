<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddIdSucursalToMultipleTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Verifica si el registro 'MATRIZ' existe y obtiene su ID
        $sucursal = DB::table('sucursales')->where('nombre', 'MATRIZ')->first();

        if ($sucursal) {
            // Actualiza solo los registros existentes donde 'id_sucursal' es NULL en la tabla 'lavadoras'
            DB::table('lavadoras')->whereNull('id_sucursal')->update(['id_sucursal' => $sucursal->id]);

            // Actualiza solo los registros existentes donde 'id_sucursal' es NULL en la tabla 'secadoras'
            DB::table('secadoras')->whereNull('id_sucursal')->update(['id_sucursal' => $sucursal->id]);

            // Actualiza solo los registros existentes donde 'id_sucursal' es NULL en la tabla 'clientes'
            DB::table('clientes')->whereNull('id_sucursal')->update(['id_sucursal' => $sucursal->id]);
        } else {
            // Mostrara si El registro matriz no se encuentra en Dicha tabla
            throw new Exception('El registro "Matriz" no se encontró en la tabla "sucursales".');
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('lavadoras', function (Blueprint $table) {
            $table->dropColumn('id_sucursal');
        });

        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn('id_sucursal');
        });

        Schema::table('secadoras', function (Blueprint $table) {
            $table->dropColumn('id_sucursal');
        });
    }
}
