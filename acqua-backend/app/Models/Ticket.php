<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_cliente',
        'envio_domicilio',
        'id_direccion',
        'id_sucursal',
        'incluye_iva',
        'tipo_credito',
        'metodo_pago',
        'total',
        'anticipo',
        'restante',
        'status'
    ];

    public function comentarios() 
    {
        return $this->hasMany(Comentario::class, 'id_ticket');
    }

    // Relaciones a Cliente, Direccion y Sucursal
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    public function direccion()
    {
        return $this->belongsTo(Direccion::class, 'id_direccion');
    }

    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class, 'id_sucursal');
    }
}
