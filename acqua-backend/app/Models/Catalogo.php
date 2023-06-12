<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catalogo extends Model
{
    use HasFactory;

    protected $fillable = [
        'name'
    ];

    protected $table = 'catalogos';

    public function servicios()
    {
        return $this->hasMany(Servicio::class);
    }
}
