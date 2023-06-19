import { Rol } from '../enums/Rol.enum';

export class AuthDto {
  token: string;
  rol: Rol;

  constructor(token: string, rol: Rol) {
    this.token = token;
    this.rol = rol;
  }
}
