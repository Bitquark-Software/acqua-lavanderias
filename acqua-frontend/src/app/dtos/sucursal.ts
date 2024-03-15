/* eslint-disable no-unused-vars */
export enum DiaHorarioSucursal
{
  LUNES = 'LUNES',
  LUNES_A_JUEVES = 'LUNES A JUEVES',
  LUNES_A_VIERNES = 'LUNES A VIERNES',
  LUNES_A_SABADO = 'LUNES A SABADO',
  LUNES_A_DOMINGO = 'LUNES A DOMINGO',
  MARTES = 'MARTES',
  MARTES_A_MIERCOLES = 'MARTES A MIERCOLES',
  MARTES_A_JUEVES = 'MARTES A JUEVES',
  MARTES_A_VIERNES = 'MARTES A VIERNES',
  MARTES_A_SABADO = 'MARTES A SABADO',
  MARTES_A_DOMINGO = 'MARTES A DOMINGO',
  MIERCOLES = 'MIERCOLES',
  MIERCOLES_A_JUEVES = 'MIERCOLES A JUEVES',
  MIERCOLES_A_VIERNES = 'MIERCOLES A VIERNES',
  MIERCOLES_A_SABADO = 'MIERCOLES A SABADO',
  MIERCOLES_A_DOMINGO = 'MIERCOLES A DOMINGO',
  JUEVES = 'JUEVES',
  JUEVES_A_VIERNES = 'JUEVES A VIERNES',
  JUEVES_A_SABADO = 'JUEVES A SABADO',
  JUEVES_A_DOMINGO = 'JUEVES A DOMINGO',
  VIERNES = 'VIERNES',
  VIERNES_A_SABADO = 'VIERNES A SABADO',
  VIERNES_A_DOMINGO = 'VIERNES A DOMINGO',
  SABADO = 'SABADO',
  SABADO_A_DOMINGO = 'SABADO A DOMINGO',
  DOMINGO = 'DOMINGO',
}

export class HorarioSucursal
{
  id!: number;
  sucursal_id!: number;
  dias!: DiaHorarioSucursal;
  horario!: string;
}

export class Sucursal
{
  id!: number;
  nombre!: string;
  horarios!: HorarioSucursal[];
}

export class SucursalResponse
{
  current_page!: number;
  data!: Sucursal[];
  prev_page_url ?: string;
  next_page_url ?: string;
}
