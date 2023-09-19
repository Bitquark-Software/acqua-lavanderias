import { Rol } from '../enums/Rol.enum';

export class Usuario
{
  id: number;
  email: string;
  nombre: string;
  name?: string;
  rol: Rol;
  role?: Rol;

  constructor(usuario:Required<Usuario>)
  {
    this.id = usuario.id;
    this.email = usuario.email;
    this.nombre = usuario.nombre;
    this.rol = usuario.rol;
  }
}

export class UsuarioResponse
{
  current_page!: number;
  data!: Usuario[];
  prev_page_url ?: string;
  next_page_url ?: string;
}