<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

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
        'status',
        'vencido'
    ];

    protected $dates = ['deleted_at'];

    public function comentarios() 
    {
        return $this->hasMany(Comentario::class, 'id_ticket');
    }

    public function precesos()
    {
        return $this->hasMany(Prendas_Ticket::class, 'id_ticket');
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
