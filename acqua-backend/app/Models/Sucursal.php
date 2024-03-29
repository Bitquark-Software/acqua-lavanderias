<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sucursal extends Model
{
    use HasFactory;

    protected $table = 'sucursales';

    protected $fillable = [
        'nombre'
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'id_sucursal');
    }

    public function lavadoras()
    {
        return $this->hasMany(Lavadora::class, 'id_sucursal');
    }

    public function secadoras()
    {
        return $this->hasMany(Secadora::class, 'id_sucursal');
    }

    public function clientes()
    {
        return $this->hasMany(Cliente::class, 'id_sucursal');
    }

    public function horarios()
    {
        return $this->hasMany(Horario::class, 'sucursal_id');
    }

    public function cortecaja()
    {
        return $this->hasMany(CorteCaja::class, 'id_sucursal');
    }
    
    public function users()
    {
        return $this->hasMany(User::class, 'id_sucursal');
    }
}
