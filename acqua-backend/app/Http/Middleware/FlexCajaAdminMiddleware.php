<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\CorteCaja;

class FlexCajaAdminMiddleware
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
        $usuario = $request->user();

        $cajaAbierta = CorteCaja::where('id_sucursal', $usuario->id_sucursal)
            ->where('abierto', true)
            ->first();

        $roles = ['encargado', 'cajero', 'operativo'];

        if (in_array($usuario->role, $roles)) {
            return $next($request);
        }

        if ($usuario->role === 'administrador' && $cajaAbierta) {
            return $next($request);
        } else {
            return response()->json(['mensaje' => 'Para procesar tickets necesitas una caja para tu sucursal'], 200);
        }

        return $next($request);
    }
}
