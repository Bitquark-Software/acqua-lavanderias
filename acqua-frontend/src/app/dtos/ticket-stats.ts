import { Ticket } from './ticket';

class TimeTrackerItem
{
  nombre!: string;
  timestamp_start!: Date | string;
  timestamp_end!: Date | string;
  diferencia_en_dias!: number;
  diferencia_en_horas!: number;
  diferencia_en_minutos!: number;
  diferencia_en_segundos!: number;
}

export class TicketStats
{
  Ticket!: Ticket;
  Conteo?: TimeTrackerItem;
  Lavado?: TimeTrackerItem;
  Reconteo?: TimeTrackerItem;
  Planchado?: TimeTrackerItem;
  Entrega?: TimeTrackerItem;
}
