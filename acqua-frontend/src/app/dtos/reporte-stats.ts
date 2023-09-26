import { Cliente } from './cliente';

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