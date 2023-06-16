import { Ubicacion } from './ubicacion';

export class Cliente {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  ubicaciones?: Ubicacion[];

  constructor(cliente:Required<Cliente>){
    this.id = cliente.id;
    this.nombre = cliente.nombre;
    this.email = cliente.email;
    this.telefono = cliente.telefono;
    this.ubicaciones = cliente.ubicaciones ?? [];
  }
}
