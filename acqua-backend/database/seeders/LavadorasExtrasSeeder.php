<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Lavadora;
use App\Models\Secadora;

class LavadorasExtrasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Lavadora::create([
            'nombre' => 'Lavadora 4',
        ]);
        Lavadora::create([
            'nombre' => 'Lavadora 5',
        ]);
        Lavadora::create([
            'nombre' => 'Lavadora 6',
        ]);
        Lavadora::create([
            'nombre' => 'Lavadora 7',
        ]);
        Lavadora::create([
            'nombre' => 'Lavadora 8',
        ]);
        Lavadora::create([
            'nombre' => 'Lavadora 9',
        ]);
        Lavadora::create([
            'nombre' => 'Lavadora 10',
        ]);


        Secadora::create([
            'nombre' =>  'Secadora 4',
        ]);
        Secadora::create([
            'nombre' =>  'Secadora 5',
        ]);
        Secadora::create([
            'nombre' =>  'Secadora 6',
        ]);
        Secadora::create([
            'nombre' =>  'Secadora 7',
        ]);
        Secadora::create([
            'nombre' =>  'Secadora 8',
        ]);
        Secadora::create([
            'nombre' =>  'Secadora 9',
        ]);
        Secadora::create([
            'nombre' =>  'Secadora 10',
        ]);
    }
}
