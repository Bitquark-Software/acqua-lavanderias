import { Rol } from '../enums/Rol.enum';

class DatosSesion
{
  id!: number;
  name!: string;
  email!: string;
  role!: Rol;
}

export class AuthDto
{
  access_token!: string;
  datos!: DatosSesion;
}
