/* eslint-disable no-unused-vars */
import { MetodoPago } from '../enums/MetodoPago.enum';
import { TipoCredito } from '../enums/TipoCredito.enum';
import { Cliente } from './cliente';
import { Comentario } from './comentario';
import { PrendaTicket } from './prenda-ticket';
import { ProcesoTicket } from './proceso';
import { Servicio } from './servicio';
import { ServicioTicket } from './servicio-ticket';
import { Sucursal } from './sucursal';
import { Ubicacion } from './ubicacion';

export enum StatusTicket
{
  Creado = 'CREADO',
  Lavado = 'LAVADO',
  Planchado = 'PLANCHADO',
  Secado = 'SECADO',
  Reconteo = 'RECONTEO',
  Entrega = 'ENTREGA',
}

export class Ticket
{
  id!: number;
  id_cliente!: number;
  cliente!: Cliente;
  envio_domicilio!: boolean;
  id_direccion?: number;
  id_sucursal?: number;
  incluye_iva!: boolean;
  tipo_credito!: TipoCredito;
  metodo_pago!: MetodoPago;
  total!: number;
  anticipo?: number;
  restante?: number;
  status!: StatusTicket;
  comentarios?: Comentario[];
  vencido!: boolean;
  created_at!: Date | string;
  prendas_ticket?: PrendaTicket[];
  procesos_ticket!: ProcesoTicket[];
  numero_referencia?: string;
  fecha_entrega?: string | Date;
}

export class ServiciosTicketServicio extends ServicioTicket
{
  servicio!: Servicio;
}

export class ReimpimirTicket extends Ticket
{
  sucursal!: Sucursal;
  servicios_ticket!: ServiciosTicketServicio[];
  direccion!: Ubicacion;
}

export class TicketReportePdf
{
  id!: number;
  metodopago!: MetodoPago;
  numero_referencia?: string;
  total!: number;
  anticipo?: number;
  restante?: number;
  nombre!: string;
}

export class TicketResponse
{
  current_page!: number;
  data!: Ticket[];
  prev_page_url ?: string;
  next_page_url ?: string;
}