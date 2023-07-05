import { Ubicacion } from './ubicacion';

export class Cliente
{
  id?: number;
  nombre: string;
  email?: string;
  telefono?: string;
  ubicaciones?: Ubicacion[];

  constructor(cliente:Partial<Cliente>)
  {
    this.nombre = cliente.nombre ?? '';
    this.email = cliente.email ?? '';
    this.telefono = cliente.telefono ?? '';
    this.ubicaciones = cliente.ubicaciones ?? [];
  }
}
