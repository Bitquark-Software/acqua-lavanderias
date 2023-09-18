export class PrendaTicket
{
  id!: number;
  id_ticket!: number;
  id_prenda!: number;
  nombre?: string;
  total_inicial?: number;
  total_final?: number;
}

export class Prenda
{
  id?: number;
  nombre!: string;
}

export class PrendaTicketReponse
{
  mensaje!: string;
  data!: PrendaTicket;
}