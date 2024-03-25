import { Role } from '../enums/Role.enum';

class DatosSesion
{
  id!: number;
  name!: string;
  email!: string;
  role!: Role;
}

export class AuthDto
{
  access_token!: string;
  datos!: DatosSesion;
}
