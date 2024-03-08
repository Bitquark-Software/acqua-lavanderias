import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { Role } from '../enums/Role.enum';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) =>
{
  const session = inject(AuthService);

  if (!session.isLoggedIn || session.getUserRole() === null)
  {
    const router = inject(Router);
    router.navigate(['/login']);
  }
  else
  {
    const rolesRoute = route.data['roles'] as Role[];

    if(!rolesRoute.includes(session.getUserRole()!))
    {
      if(session.getUserRole() == Role.Operativo)
      {
        const router = inject(Router);
        router.navigate(['/tickets']);
      }
    }
  }
  return session.isLoggedIn;
};
