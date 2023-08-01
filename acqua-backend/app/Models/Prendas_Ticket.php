<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prendas_Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_ticket',
        'id_prenda',
        'total_inicial',
        'total_final'
    ];

    protected $table = 'prendas_tickets';

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'id_ticket');
    }

    public function prenda()
    {
        return $this->belongsTo(Prenda::class, 'id_prenda');
    }
}
