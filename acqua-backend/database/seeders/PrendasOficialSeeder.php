<?php

namespace Database\Seeders;

use App\Models\Prenda;
use Illuminate\Database\Seeder;

class PrendasOficialSeeder extends Seeder
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
                "nombre" => "Prendas"
            ]
        );
        Prenda::create(
            [
                "nombre" => "Calceta Par"
            ]
        );
        Prenda::create(
            [
                "nombre" => "Calceta Impar"
            ]
        );
        Prenda::create(
            [
                "nombre" => "R. Int"
            ]
        );
        Prenda::create(
            [
                "nombre" => "Sabanas"
            ]
        );
        Prenda::create(
            [
                "nombre" => "Fundas"
            ]
        );
        Prenda::create(
            [
                "nombre" => "Cob/Edr/Edrc"
            ]
        );
        Prenda::create(
            [
                "nombre" => "Almohada"
            ]
        );
        Prenda::create(
            [
                "nombre" => "Cubrecolchon"
            ]
        );
    }
}
