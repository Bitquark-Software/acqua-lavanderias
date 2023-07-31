<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'email',
        'telefono'
    ];

    public function direccion()
    {
        return $this->hasMany(Direccion::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'id_cliente');
    }
}
