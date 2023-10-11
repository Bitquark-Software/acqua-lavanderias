import { Cliente } from './cliente';
import { Ticket } from './ticket';

export class ReporteStats
{
  montoCobrado!: number;
  montoPorCobrar!: number;
  totalIngresos!: number;
}

export class UsuariosReporteStats
{
  clientesNuevos!: number;
  clientes!: Cliente[];
}

export class PDFReporteStats
{
  tickets!: Ticket[];
  efectivo!: number;
  transferencia!: number;
  tarjeta!: number;
}