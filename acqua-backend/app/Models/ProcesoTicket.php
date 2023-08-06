<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcesoTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_ticket',
        'id_proceso',
        'timestamp_start',
        'timestamp_end',
        'id_user',
        'id_lavadora',
        'id_secadora',
        'id_empleado'
    ];

    // Relaciones 
    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'id_ticket');
    }

    public function proceso()
    {
        return $this->belongsTo(Proceso::class, 'id_proceso');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function lavadora()
    {
        return $this->belongsTo(Lavadora::class, 'id_lavadora');
    }

    public function secadora()
    {
        return $this->belongsTo(Secadora::class, 'id_secadora');
    }
}
