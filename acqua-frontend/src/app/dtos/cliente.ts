import { Ubicacion } from './ubicacion';

export class Cliente
{
  id?: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: Ubicacion[];

  constructor(cliente:Partial<Cliente>)
  {
    this.nombre = cliente.nombre ?? '';
    this.email = cliente.email ?? '';
    this.telefono = cliente.telefono ?? '';
    this.direccion = cliente.direccion ?? [];
  }
}

export class ClienteResponse
{
  current_page!: number;
  data!: Cliente[];
  prev_page_url ?: string;
  next_page_url ?: string;
}
