<?php

namespace Database\Seeders;

use App\Models\Sucursal;
use Illuminate\Database\Seeder;

class Sucursales extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $existeSucursal = Sucursal::where('nombre', 'MATRIZ')->exists();

        if (!$existeSucursal) {
            Sucursal::create(
                [
                    "nombre" => "MATRIZ"
                ]
            );
        }
    }
}
