<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
USE App\Models\CorteCaja;

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

        $cajaAbierta = CorteCaja::where('id_sucursal', $idSucursal)
            ->where('abierto', true)
            ->exists();

        if (!$cajaAbierta) {
            return response()->json(['mensaje' => 'Caja todavia no esta abierta para esta sucursal'], 200);
        }

        return $next($request);
    }
}
