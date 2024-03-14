import { Role } from '../enums/Role.enum';
import { AuthDto } from './auth-dto';

describe('AuthDto', () =>
{
  it('should create an instance', () =>
  {
    expect(new AuthDto('fake token', Role.Administrador)).toBeTruthy();
  });
});
