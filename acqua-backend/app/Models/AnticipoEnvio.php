<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnticipoEnvio extends Model
{
    use HasFactory;

    protected $fillable = [
        'anticipo',
        'metodopago',
        'id_ticket',
        'cobrado_por',
        'numero_referencia',
        'restante'
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'id_ticket');
    }
}
