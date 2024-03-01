<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CancelacionCodigo extends Model
{
    use HasFactory;

    protected $fillable = [
        'codigo',
        'usado',
        'id_ticket',
        'used_at'
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'id_ticket');
    }    
}
