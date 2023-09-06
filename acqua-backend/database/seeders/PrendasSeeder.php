<?php

namespace Database\Seeders;

use App\Models\Prenda;
use Illuminate\Database\Seeder;

class PrendasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Prenda::create(
            [
                "nombre" => "PLAYERA"
            ]
        );
        Prenda::create(
            [
                "nombre" => "CAMISA"
            ]
        );
        Prenda::create(
            [
                "nombre" => "PANTALON DE MEZCLILLA"
            ]
        );
        Prenda::create(
            [
                "nombre" => "PANTALON DE VESTIR"
            ]
        );
        Prenda::create(
            [
                "nombre" => "CALCETIN SUELTO"
            ]
        );
        Prenda::create(
            [
                "nombre" => "PAR DE CALCETINES"
            ]
        );
        Prenda::create(
            [
                "nombre" => "CAMISETA"
            ]
        );
        Prenda::create(
            [
                "nombre" => "SACO"
            ]
        );
    }
}
