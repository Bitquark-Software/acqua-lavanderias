import { DataPagination } from '../dtos/data-pagination';

// Tipos Principal

export class SucursalData
{
  id?: number;
  nombre?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export class CorteCaja
{
  id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  abierto?: number;
  monto_apertura?: string;
  efectivo?: string;
  transferencia?: string;
  tarjeta?: string;
  monto_total?: string;
  monto_cierre?: string;
  id_sucursal?: number;
  id_user?: number;
  created_at?: string;
  updated_at?: string;
  sucursal?: SucursalData;
}

// Tipo definido para respuesta get (corte de caja)

export class CorteCajaResponseGet<CorteCaja> implements DataPagination<CorteCaja>
{
  data!: CorteCaja[];
}

// Tipo definido para la respuesta post (corte de caja)

export class CorteCajaResponsePostData
{
  fecha_inicio?: string;
  id_sucursal?: number;
  id_user?: number;
  monto_apertura?: number;
  updated_at?: string;
  created_at?: string;
  id?: number;
}

export class CorteCajaResponsePost
{
  mensaje!: string;
  data!: CorteCajaResponsePostData;
}

// Tipo definido para la respuesta put (corte de caja), en caso de que se requiera una clase

export class CorteCajaResponsePut
{
  mensaje!: string;
}

// Tipo definido para la respuesta delete (corte de caja), en caso de que se requiera una clase

export class CorteCajaResponseDelete
{
  mensaje!: string;
}

// Tipos definidos para la respuesta get (ganancias)

export class TicketSummary
{
  id?: number;
  tipo_credito?: string;
  vencido?: number;
  total?: string;
  nombre?: string;
  metodopago?: string;
  numero_referencia?: string | null;
  anticipo?: string;
  restante?: string;
  cobrado_por?: string;
}

export class AnticiposEnvios
{
  tickets?: TicketSummary[];
  efectivo?: number;
  transferencia?: number;
  tarjeta?: number;
  montoTotal?: number;
}

export class GananciasResponseGet
{
  tickets?: TicketSummary[];
  efectivo?: number;
  transferencia?: number;
  tarjeta?: number;
  montoTotal?: number;
  anticiposEnvios?: AnticiposEnvios;
}