<?php

namespace App\Http\Controllers;

use App\Models\Catalogo;
use App\Models\Prenda;
use App\Models\ServicioTicket;

use Illuminate\Support\Str;
use Illuminate\Http\Request;

use Illuminate\Database\Eloquent\ModelNotFoundException as ModelNotFound;

class PrendaController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $request->validate([
            'idTicket' => ['required', 'exists:tickets,id']
        ]);

        // Buscamos el ID de Ropa de Cama
        try {
            $idRopaCama = Catalogo::where('name', 'ropa de cama')
                ->with('servicios')
                ->firstOrFail();
        } catch (ModelNotFound $e) {
            return response()->json([
                'mensaje' => 'Catalogo ropa de cama no encontrado'
            ]);
        }

        $serviciosRopaCama = [];
        $ropaCama = ['almohada', 'cob/edr/edrc', 'cubrecolchon', 'sabanas'];

        foreach ($idRopaCama->servicios as $servicio) {
            $serviciosRopaCama[] = $servicio['id'];
        }

        $serviciosTicket = ServicioTicket::where('id_ticket', $request->idTicket)
            ->whereIn('id_servicio', $serviciosRopaCama)
            ->get()->toArray();

        $prendasBD =  Prenda::orderBy('nombre', 'ASC')->get()->toArray();

        if (count($serviciosTicket) === 0) {
            foreach ($prendasBD as $prenda) {
                if (!in_array(strtolower($prenda['nombre']), $ropaCama)) {
                    $prendasArray[] = $prenda;
                }
            }
        }

        return $prendasArray ?? $prendasBD;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'nombre' => ['required', 'string', 'max:80', 'unique:prendas']
        ]);

        $prenda = Prenda::create([
            'nombre' => Str::upper($request->input('nombre'))
        ]);

        return response()->json([
            'mensaje' => 'Prenda agregada exitosamente',
            'data' => $prenda
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Prenda::find($id);
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
        $this->validate($request, [
            'nombre' => ['required', 'string', 'max:80']
        ]);

        $prenda = Prenda::findOrFail($id);

        // Verifica si el Nombre ya existe
        $verifi = Prenda::where('nombre', Str::upper($request->nombre))->exists();

        // Verificar si el nombre ha sido modificado y si ya existe en otro registro
        if ($prenda->nombre != $request->nombre && $verifi) {
            return response()->json(['error' => 'El nombre ya existe, debe ser unico.'], 422);
        }

        $prenda->update([
            'nombre' => Str::upper($request->nombre)
        ]);

        return response()->json([
            'mensaje' => 'Prenda actualizada correctamente'
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
        $prenda = Prenda::findOrFail($id);
        $prenda->delete();

        return response()->json([
            'mensaje' => 'Prenda Eliminada Correctamente'
        ], 204);
    }
}
