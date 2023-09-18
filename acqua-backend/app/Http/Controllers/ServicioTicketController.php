<?php

namespace App\Http\Controllers;

use App\Models\ServicioTicket;
use Illuminate\Http\Request;

class ServicioTicketController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
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
            'id_ticket' => ['required', 'exists:tickets,id'],
            'id_servicio' => ['required', 'exists:servicios,id'],
            'kilos' => ['required', 'numeric'],
        ]);

        $servicioTicket = ServicioTicket::create([
            'id_ticket' => $request->id_ticket,
            'id_servicio' => $request->id_servicio,
            'kilos' => $request->kilos,
        ]);

        return response()->json([
            'message' => 'Servicio Agregado Exitosamente',
            'data' => $servicioTicket,
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ServicioTicket  $servicioTicket
     * @return \Illuminate\Http\Response
     */
    public function show(ServicioTicket $servicioTicket)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ServicioTicket  $servicioTicket
     * @return \Illuminate\Http\Response
     */
    public function edit(ServicioTicket $servicioTicket)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ServicioTicket  $servicioTicket
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, ServicioTicket $servicioTicket)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ServicioTicket  $servicioTicket
     * @return \Illuminate\Http\Response
     */
    public function destroy(ServicioTicket $servicioTicket)
    {
        //
    }
}
