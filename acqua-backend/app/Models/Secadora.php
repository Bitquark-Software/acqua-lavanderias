<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Secadora extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre'
    ];

    public function procesosTicket()
    {
        return $this->hasOne(ProcesoTicket::class, 'id_secadora');
    }
}
