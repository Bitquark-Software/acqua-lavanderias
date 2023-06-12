import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(AuthService);
  const isLoggedIn = session.session !== null;
  if (!isLoggedIn) {
    const router = inject(Router);
    router.navigate(['/login']);
  }
  return isLoggedIn;
};
