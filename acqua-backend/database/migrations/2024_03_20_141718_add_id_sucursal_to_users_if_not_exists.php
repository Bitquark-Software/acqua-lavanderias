<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Sucursal;

class AddIdSucursalToUsersIfNotExists extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $idMatriz = DB::table('sucursales')->where('nombre', 'MATRIZ')->value('id');
            
            if ($idMatriz === null) {
                // Crear la sucursal MATRIZ si no existe
                $sucursal = new Sucursal;
                $sucursal->nombre = 'MATRIZ';
                $sucursal->save();

                // Asignar el ID de la nueva sucursal a $idMatriz
                $idMatriz = $sucursal->id;
            }

            if (!Schema::hasColumn('users', 'id_sucursal')) {
                $table->unsignedBigInteger('id_sucursal')->default($idMatriz);
                $table->foreign('id_sucursal')->references('id')->on('sucursales');
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
