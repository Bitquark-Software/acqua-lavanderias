import { Role } from '../enums/Role.enum';

export class Usuario
{
  id: number;
  email: string;
  nombre: string;
  name?: string;
  role?: Role;

  constructor(usuario:Required<Usuario>)
  {
    this.id = usuario.id;
    this.email = usuario.email;
    this.nombre = usuario.nombre;
    this.role = usuario.role;
  }
}

export class UsuarioResponse
{
  current_page!: number;
  data!: Usuario[];
  prev_page_url ?: string;
  next_page_url ?: string;
}