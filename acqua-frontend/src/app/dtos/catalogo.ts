import { Servicio } from './servicio';

export class Categoria
{
  id!: number;
  name!: string;
  servicios ?: Servicio[];
}

export class Catalogo
{
  current_page?: number;
  data?: Categoria[];
  prev_page_url?: string;
  next_page_url?: string;
}
