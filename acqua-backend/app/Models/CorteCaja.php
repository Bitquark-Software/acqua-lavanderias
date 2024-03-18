<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorteCaja extends Model
{
    use HasFactory;

    protected $fillable = [
        'fecha_inicio',
        'fecha_fin',
        'abierto',
        'efectivo',
        'transferencia',
        'tarjeta',
        'monto_total',
        'id_sucursal',
        'id_user'
    ];

    public function sucursal() 
    {
        return $this->belongsTo(Sucursal::class, 'id_sucursal');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}