<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $this->validate($request, [
            'email' => ['required','email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $accessToken = $user->createToken('login-token')->accessToken;

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'id_sucursal' => $user->id_sucursal
            ];
            
            return new Response([
                'access_token' => $accessToken,
                'datos' => $userData,
            ], 200);
        }
    
        return new Response(['error' => 'Credenciales Incorrectas'], 401);
    }

    public function logout(Request $request): Response
    {
        $user = $request->user();

        if ($user) {
            $user->tokens()->delete(); // Revocar todos los tokens de acceso del usuario
        }

        return new Response(['message' => 'Sesion cerrada correctamente'], 200);
    }
}
