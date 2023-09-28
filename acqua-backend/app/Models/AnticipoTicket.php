<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnticipoTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_ticket',
        'anticipo',
        'metodoPago',
        'cobrado_por',
        'numero_referencia'
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'id_ticket');
    }
}
