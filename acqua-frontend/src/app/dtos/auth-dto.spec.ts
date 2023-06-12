import { Rol } from '../enums/Rol.enum';
import { AuthDto } from './auth-dto';

describe('AuthDto', () => {
  it('should create an instance', () => {
    expect(new AuthDto('fake token', Rol.Administrador)).toBeTruthy();
  });
});
