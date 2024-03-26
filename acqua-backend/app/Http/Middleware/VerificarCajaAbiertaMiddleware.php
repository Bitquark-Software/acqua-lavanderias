<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\CorteCaja;

class VerificarCajaAbiertaMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $idSucursal = $request->user()->id_sucursal;

        // Si el usuario es un administrador, permitir el acceso
        if ($request->user()->role == 'administrador') {
            return $next($request);
        }

        $cajaAbierta = CorteCaja::where('id_sucursal', $idSucursal)
            ->where('abierto', true)
            ->exists();

        if (!$cajaAbierta) {
            return response()->json(['mensaje' => 'Caja todavia no esta abierta para tu sucursal actual'], 200);
        }

        return $next($request);
    }
}
