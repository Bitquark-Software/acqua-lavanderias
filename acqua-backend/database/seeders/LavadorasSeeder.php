<?php

namespace Database\Seeders;

use App\Models\Lavadora;
use App\Models\Secadora;
use Illuminate\Database\Seeder;

class LavadorasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Lavadora::create([
            'nombre' => 'Lavadora 1',
        ]);
        Lavadora::create([
            'nombre' => 'Lavadora 2',
        ]);
        Lavadora::create([
            'nombre' => 'Lavadora 3',
        ]);
        Secadora::create([
            'nombre' =>  'Secadora 1',
        ]);
        Secadora::create([
            'nombre' =>  'Secadora 2',
        ]);
        Secadora::create([
            'nombre' =>  'Secadora 3',
        ]);
    }
}
