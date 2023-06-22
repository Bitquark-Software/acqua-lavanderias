<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $fillable = [
        'catalogo_id',
        'clave_servicio',
        'nombre_servicio',
        'importe',
        'cantidad_minima'
    ];

    public function catalogo()
    {
        return $this->belongsTo(Catalogo::class);
    }
}
