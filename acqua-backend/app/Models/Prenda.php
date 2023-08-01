<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prenda extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre'
    ];

    public function prendasTicket()
    {
        return $this->hasMany(Prendas_Ticket::class, 'id_prenda');
    }
}
