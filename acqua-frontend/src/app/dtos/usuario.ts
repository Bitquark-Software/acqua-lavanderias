import { Rol } from '../enums/Rol.enum';

export class Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;

  constructor(usuario:Required<Usuario>) {
    this.id = usuario.id;
    this.email = usuario.email;
    this.nombre = usuario.nombre;
    this.rol = usuario.rol;
  }
}
