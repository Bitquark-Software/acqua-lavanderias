/* eslint-disable no-unused-vars */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { Cliente } from 'src/app/dtos/cliente';
import { Rol } from 'src/app/enums/Rol.enum';
import { AuthService } from 'src/app/services/auth-service.service';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent
{
  isAdmin = false;
  isLoadingClientes = false;
  isModalOpened = false;

  busquedaCliente = '';

  coincidenciasClientes: Cliente[] = [];

  @ViewChild('modalClientesNavbar') modalClientesNavbar!: ElementRef<HTMLDialogElement>;

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
    private clientesService: ClientesService,
  )
  {
    this.isAdmin = this.authService.session?.datos.role === Rol.Administrador ?? false;
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
}
