<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sucursal extends Model
{
    use HasFactory;

    protected $table = 'sucursales';

    protected $fillable = [
        'nombre'
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'id_sucursal');
    }
}
