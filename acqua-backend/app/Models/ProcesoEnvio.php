<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcesoEnvio extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre'
    ];

    public function envioFlexs() 
    {
        return $this->hasMany(EnvioFlex::class, 'id_proceso_envios');
    }
}
