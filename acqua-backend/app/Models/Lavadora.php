<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lavadora extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'id_sucursal'
    ];

    protected function procesosTicket()
    {
        return $this->hasOne(procesoTicket::class, 'id_lavadora');
    }

    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class, 'id_sucursal');
    }
}
