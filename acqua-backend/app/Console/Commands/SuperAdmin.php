<?php

namespace App\Console\Commands;

use App\Models\User;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class SuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'super:admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Registra a una cuenta administradora';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $perfiles = User::count();

        if ($perfiles > 0) {
            $this->error('No se puede crear una cuenta maestra');
            return 0;
        }

        $email = $this->ask('Ingrese el correo para la cuenta maestra: ');

        if (!$email) {
            $this->error('Email no valido');
            return 0;
        }

        $this->info('Creando cuenta maestra....');

        try {
            $password = Str::random(8);
            User::create([
                'email' => $email,
                'name' => 'Administrador',
                'password' => bcrypt($password),
                'role' => 'administrador',
            ]);
    
            $this->info('Cuenta maestra creada exitosamente:');
            $this->info("[usuario]: {$email}");
            $this->info("[password]: {$password}");
        } catch (Exception $e) {
            $this->error($e->getMessage());
        }
    }
}
