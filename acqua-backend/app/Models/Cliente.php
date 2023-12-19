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
        'telefono',
        'id_sucursal'
    ];

    public function direccion()
    {
        return $this->hasMany(Direccion::class)->where('activo', true);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'id_cliente');
    }

    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class, 'id_sucursal');
    }
}
