import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { Role } from '../enums/Role.enum';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) =>
{
  const categoriesURLs: RegExp[] = [
    /\/nueva-categoria$/,
    /\/editar-categoria\/(\d+)$/,
  ];

  const servicesURLs: RegExp[] = [
    /\/nuevo-servicio\/(\d+)$/,
    /\/editar-servicio\/(\d+)$/,
  ];

  function checkURLBelongCategory(url: string): boolean
  {
    return categoriesURLs.some(route => route.test(url));
  }

  function checkURLBelongServices(url: string): boolean
  {
    return servicesURLs.some(route => route.test(url));
  }

  function getIdURLUsingRegExp(urlArray: RegExp[] = []): number | null
  {
    for (const regex of urlArray)
    {
      const match = state.url.match(regex);

      if (match)
      {
        return Number(match[1]);
      }
    }
    return null;
  }

  function getIdServiceURL()
  {
    return getIdURLUsingRegExp(servicesURLs);
  }

  const session = inject(AuthService);

  if (!session.isLoggedIn || session.getUserRole() === null)
  {
    const router = inject(Router);
    router.navigate(['/login']);
  }
  else
  {
    const rolesRoute = route.data['roles'] as Role[];

    if(rolesRoute.includes(session.getUserRole()!))
    {
      return true;
    }
    else
    {
      const router = inject(Router);

      if(session.getUserRole() === Role.Operativo)
      {
        router.navigate(['/tickets']);
        return true;
      }
      if(session.getUserRole() === Role.Cajero && checkURLBelongCategory(state.url))
      {
        router.navigate(['/categorias']);
        return true;
      }
      if(session.getUserRole() === Role.Cajero && checkURLBelongServices(state.url))
      {
        const id = getIdServiceURL();

        if(id !== null)
        {
          router.navigate([`/ver-servicios/${id}`]);
          return true;
        }
      }

      router.navigate(['/dashboard']);
      return true;
    }
  }

  return session.isLoggedIn;
};
