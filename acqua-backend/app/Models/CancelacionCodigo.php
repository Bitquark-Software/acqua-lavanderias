<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CancelacionCodigo extends Model
{
    use HasFactory;

    protected $fillable = [
        'codigo',
        'motivo',
        'usado',
        'id_ticket',
        'id_user',
        'used_at'
    ];

    public function ticket()
    {
        return $this->hasOne(Ticket::class, 'id_ticket');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

}
