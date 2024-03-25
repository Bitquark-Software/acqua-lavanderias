import { Role } from '../enums/Role.enum';
import { Sucursal } from './sucursal';

export class Usuario
{
  id: number;
  email: string;
  nombre: string;
  name?: string;
  role?: Role;
  id_sucursal?: number;

  sucursal?: Sucursal;
  constructor(usuario:Required<Usuario>)
  {
    this.id = usuario.id;
    this.email = usuario.email;
    this.nombre = usuario.nombre;
    this.role = usuario.role;
    this.id_sucursal = usuario.id_sucursal;
  }
}

export class UsuarioResponse
{
  current_page!: number;
  data!: Usuario[];
  prev_page_url ?: string;
  next_page_url ?: string;
}