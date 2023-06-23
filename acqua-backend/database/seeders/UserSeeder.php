<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'name' => 'Usuario de Prueba',
            'email' => 'usuario@prueba.com',
            'password' => Hash::make('password'),
            'role' => 'administrador'
        ]);

        User::create([
            'name' => 'Usuario de Prueba',
            'email' => 'usuario2@prueba.com',
            'password' => Hash::make('password'),
            'role' => 'empleado'
        ]);
    }
}
