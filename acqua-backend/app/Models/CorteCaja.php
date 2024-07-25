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
        'monto_apertura',
        'efectivo',
        'transferencia',
        'tarjeta',
        'monto_total',
        'monto_cierre',
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