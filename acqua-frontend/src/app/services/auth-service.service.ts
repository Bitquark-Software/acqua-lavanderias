import { Injectable } from '@angular/core';
import { AuthDto } from '../dtos/auth-dto';

@Injectable ({
  providedIn: 'root',
})
export class AuthService {
  session: AuthDto | null;

  constructor() {
    this.session = null;
  }
}
