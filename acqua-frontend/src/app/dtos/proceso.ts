/* eslint-disable no-unused-vars */
export class Proceso
{
  id!: number;
  nombre!: string;
}

export enum ProcesosAcqua
{
  CREADO = 'CREADO',
  CONTEO = 'CONTEO',
  DESMANCHADO = 'DESMANCHADO',
  LAVADO = 'LAVADO',
  DOBLADO = 'DOBLADO',
  RECONTEO = 'RECONTEO',
  SECADO = 'SECADO',
  ENTREGA = 'ENTREGA'
}

export class ProcesoTicket
{
  id!: number;
  id_proceso!: number;
  timestamp_start?: Date | string;
  timestamp_end?: Date | string;
  id_lavadora?: number;
  id_secadora?: number;
}

export class ResponseDataLavadoraSecadoraExtra
{
  created_at?: Date | string;
  id!: number;
  id_lavadora?: number;
  id_secadora?: number;
  id_ticket!: number;
  timestamp_end?: Date | string;
  timestamp_start?: Date | string;
  updated_at?: Date | string;
  user_id!: number;

}

export class ResponseLavadoraSecadoraExtra
{
  data?: ResponseDataLavadoraSecadoraExtra;
  mensaje?: string;
}

export class ResponseRegistrarProceso
{
  data?: ProcesoTicket;
  mensaje?: string;
}