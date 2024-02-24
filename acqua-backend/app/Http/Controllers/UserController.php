<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return User::paginate(10);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'max:30'],
            'email' => ['required', 'unique:users', 'email', 'max:60'],
            'password' => ['required'],
            'role' => ['required', 'in:administrador,encargado,cajero,operativo']
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role
        ]);

        return response()->json([
            'message' => 'User Creado Exitosamente',
            'data' => $user
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return User::find($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => ['required', 'max:30'],
            'email' => ['required', 'email', 'max:60'],
            'password' => ['nullable'],
            'role' => ['required', 'in:administrador,encargado,cajero,operativo']
        ]);

        $user = User::findOrFail($id);

        if (isset($request->password)) {
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);
        } else {
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'role' => $request->role,
            ]);
        }

        return response()->json([
            'message' => 'User Actualizado correctamente'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        $adminsRestantes = User::where('role', 'administrador')->where('id', '!=', $user->id)->get()->count();

        if ($adminsRestantes == 0) {
            return response()->json([
                'message' => 'Debe haber al menos un administrador en el sistema'
            ], 400);
        }

        // Evita que el usuario se elimine a si mismo 
        if (auth()->user()->id === $user->id) {
            return response()->json([
                'message' => 'No puedes eliminar tu usuario actual'
            ], 403);
        }

        $user->delete();


        return response()->json([
            'message' => 'User Eliminado Correctamente'
        ], 204);
    }
}
