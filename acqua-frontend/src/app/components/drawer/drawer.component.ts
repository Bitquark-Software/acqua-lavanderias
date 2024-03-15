/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Cliente } from 'src/app/dtos/cliente';
import { Role } from 'src/app/enums/Role.enum';
import { AuthService } from 'src/app/services/auth-service.service';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent
{
  userRole: Role | undefined = undefined;
  Role = Role;
  isLoadingClientes = false;
  isModalOpened = false;

  busquedaCliente = '';

  coincidenciasClientes: Cliente[] = [];

  @ViewChild('modalClientesNavbar') modalClientesNavbar!: ElementRef<HTMLDialogElement>;

  protected readonly DASHBOARD_URL = '/dashboard';
  private currentUrl!: string;

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
    private clientesService: ClientesService,
    private router: Router,
    private location: Location,
  )
  {
    this.userRole = this.authService.session?.datos.role;
    this.currentUrl = this.location.path();
  }

  openClientesModal()
  {
    if(!this.isModalOpened)
    {
      this.modalClientesNavbar.nativeElement.showModal();
      this.isModalOpened = true;

      this.modalClientesNavbar.nativeElement.addEventListener('close', () =>
      {
        this.isModalOpened = false;
      });
    }
  }

  buscarCliente()
  {
    if(this.busquedaCliente.trim().length > 0)
    {
      this.coincidenciasClientes = [];
      this.isLoadingClientes = true;

      const input = this.busquedaCliente.trim();
      const mobileRegex = /^\d{1,10}$/;

      if(mobileRegex.test(input))
      {
        this.clientesService.buscarClientePorTelefono(input)
          .subscribe({
            next: (clientes) =>
            {
              this.coincidenciasClientes = clientes;
              this.isLoadingClientes = false;
            },
            error: () =>
            {
              this.isLoadingClientes = false;
            },
          });
      }
      else
      {
        this.clientesService.buscarClientePorNombre(input)
          .subscribe({
            next: (clientes) =>
            {
              this.coincidenciasClientes = clientes;
              this.isLoadingClientes = false;
            },
            error: () =>
            {
              this.isLoadingClientes = false;
            },
          });
      }
    }
    else
    {
      this.coincidenciasClientes = [];
    }
  }

  dismissModal()
  {
    this.modalClientesNavbar.nativeElement.close();
  }

  btoa(cliente: Cliente)
  {
    return btoa(JSON.stringify(cliente));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logout(event:any)
  {
    event.preventDefault();
    this.authService.logout().add(() =>
    {
      this.toast.show('¡Hasta luego!');
      this.router.navigateByUrl('/login', { skipLocationChange: true });
    });
  }

  public shouldEnableBackButton()
  {
    return this.currentUrl != this.DASHBOARD_URL;
  }

  public navigateBack()
  {
    history.back();
  }
}
