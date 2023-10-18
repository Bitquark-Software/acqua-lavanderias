<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServicioTicket extends Model
{
    protected $fillable = ['id_ticket', 'id_servicio', 'kilos'];
    use HasFactory;

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio');
    }
}
