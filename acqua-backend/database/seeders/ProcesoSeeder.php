<?php

namespace Database\Seeders;

use App\Models\Proceso;
use Illuminate\Database\Seeder;

class ProcesoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Proceso::create([
            'nombre' => "CONTEO",
        ]);

        Proceso::create([
            'nombre' => "DESMANCHADO",
        ]);

        Proceso::create([
            'nombre' => "LAVADO",
        ]);

        Proceso::create([
            'nombre' => "SECADO",
        ]);

        Proceso::create([
            'nombre' => "DOBLADO",
        ]);

        Proceso::create([
            'nombre' => "RECONTEO",
        ]);

        Proceso::create([
            'nombre' => "ENTREGA",
        ]);
    }
}
