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

    public function procesos()
    {
        return $this->hasMany(Procesos_Ticket::class, 'id_prenda');
    }
}
