<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class BaseReportController extends Controller
{
    protected $estilos = '
    <style>
        p {
            text-align: center;
            font-size: 13px;
        }
        table {
            text-align:center;
            width: 100%;
            border: 1px dashed black;
            border-radius: 10px;
            padding: 10px;
        }
        th, td {
            padding: 5px;
            text-align: center;
            font-size: 12px;
        }
        .texto {
            text-align: center;
        }
        .negrita {
            font-weight: bold
        }
        .alinear-derecha {
            text-align: right;
        }
        .alinear-izquierdda {
            text-align: left;
        }
        .verdeBag {
            background-color : #008080;
            color : #ffffff;
        }
        .bordestd {
            border-bottom: 1px solid rgb(86, 197, 252);
        }
        .bordeds {
            border: 1px dashed black;
            border-radius: 2px;
        }
        .page-break {
            page-break-before: always;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
            z-index: 1000;
            font-size: 90px;
            text-align: center;
        }
        header {
            position: fixed;
            top: 0cm;
            left: 0cm;
            right: 0cm;
            height: 2cm;
        }
        body {
            margin-top: 5cm; /* Ajusta este valor según la altura de tu encabezado */
        }
    </style>';

    /**
     * Este método calcula la diferencia en minutos entre dos timestamps.
     *
     * @param string $timestampStart Un string que representa el timestamp de inicio en el formato 'Y-m-d H:i:s'.
     * @param string $timestampEnd Un string que representa el timestamp de fin en el formato 'Y-m-d H:i:s'.
     *
     * @return int Retorna la diferencia en minutos entre los dos timestamps.
     */
    function calcularDiferenciaEnMinutos($timestampStart, $timestampEnd)
    {
        $start = Carbon::createFromFormat('Y-m-d H:i:s', $timestampStart);
        $end = Carbon::createFromFormat('Y-m-d H:i:s', $timestampEnd);
        return $end->diffInMinutes($start);
    }

    /**
     * Este método convierte los minutos en un formato de tiempo más legible.
     *
     * @param int $minutos Un entero que representa los minutos a convertir.
     *
     * @return string Retorna una cadena que representa el tiempo en un formato de 'Días, Horas, Minutos'.
     */
    function convertirTiempo($minutos)
    {
        // Calcula el número de días, horas y minutos
        $dias = floor($minutos / (60 * 24));
        $horas = floor(($minutos - $dias * 60 * 24) / 60);
        $min = $minutos - ($dias * 60 * 24) - ($horas * 60);

        $tiempo = ""; // Inicializa el string

        // Concatena los días, horas y minutos a la cadena de tiempo
        if ($dias > 0) {
            $tiempo .= "$dias Día(s)";
        }
        if ($horas > 0) {
            $tiempo .= "$horas Hora(s) ";
        }
        if ($min > 0) {
            $tiempo .= "$min Minuto(s)";
        }
        return $tiempo;
    }

    function verificacionFechas($inicioFechaConsulta, $finFechaConsulta)
    {
        if (empty($inicioFechaConsulta) && empty($finFechaConsulta)) {
            // Fecha Inicio y Final no Proporcinadas
            $inicioFechaConsulta = Carbon::now()->startOfDay();
            $finFechaConsulta = Carbon::now()->endOfDay();
        } else {
            /// Fechas Proporcinadas
            $inicioFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_inicio'))->startOfDay();
            $finFechaConsulta = Carbon::createFromFormat('Y-m-d H:i:s', request('fecha_fin'))->endOfDay();
        }

        return [
            'inicioFecha' => $inicioFechaConsulta,
            'finFecha' => $finFechaConsulta
        ];
    }
}
