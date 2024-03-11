<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EnvioFlex extends Model
{
    use HasFactory;

    protected $table = 'envio_flexs';

    protected $fillable = [
        'id_proceso_envios',
        'id_sucursal',
        'id_ticket',
        'resivido',
        'fecha_reubicacion',
        'entregado',
        'fecha_resivido',
        'id_user'
    ];

    public function procesoEnvios()
    {
        return $this->belongsTo(ProcesoEnvio::class, 'id_proceso_envios');
    }

    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class, 'id_sucursal');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'id_ticket');
    }
}
