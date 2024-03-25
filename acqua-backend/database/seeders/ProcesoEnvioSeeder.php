<?php

namespace Database\Seeders;

use App\Models\ProcesoEnvio;
use Illuminate\Database\Seeder;

class ProcesoEnvioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ProcesoEnvio::create([
            'nombre' => "RECOLECCION",
        ]);

        ProcesoEnvio::create([
            'nombre' => "CONFIRMACION",
        ]);

        ProcesoEnvio::create([
            'nombre' => "ENVIO/ENTREGA",
        ]);

        ProcesoEnvio::create([
            'nombre' => "FINALIZADO",
        ]);
    }
}
