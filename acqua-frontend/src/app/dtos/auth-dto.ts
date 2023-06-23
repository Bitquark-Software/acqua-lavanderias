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
  acess_token!: string;
  datos!: DatosSesion;
}
