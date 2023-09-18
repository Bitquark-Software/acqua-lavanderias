/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { Usuario, UsuarioResponse } from 'src/app/dtos/usuario';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
})
export class PersonalComponent
{
  usuarios: Usuario[];
  isLoading = true;
  personalResponse!: UsuarioResponse;
  isDeleting = false;
  deletingId = 0;

  constructor(
    private empleadosService: AuthService,
    private toast: HotToastService,
  )
  {
    this.usuarios = [];
    this.fetchEmpleados();
  }

  fetchEmpleados(page?: number)
  {
    this.usuarios = [];
    this.isLoading = true;
    this.empleadosService.getEmpleados(page).subscribe({
      next: (response) =>
      {
        this.personalResponse = response;
        this.usuarios = response.data;
        this.isLoading = false;
      },
      error: (err) => this.showError(err),
    });
  }

  fetchNextPage()
  {
    if(this.personalResponse.next_page_url)
    {
      const nextPageNumber = parseInt(this.personalResponse.next_page_url
        .charAt(this.personalResponse.next_page_url.length - 1));
      this.fetchEmpleados(nextPageNumber);
    }
  }

  fetchPreviousPage()
  {
    if(this.personalResponse.prev_page_url)
    {
      const previousPageNumber = parseInt(this.personalResponse.prev_page_url
        .charAt(this.personalResponse.prev_page_url.length - 1));
      this.fetchEmpleados(previousPageNumber);
    }
  }

  deleteEmpleado(id: number)
  {
    if(!this.isDeleting)
    {
      this.deletingId = id;
      this.isDeleting = true;
      this.empleadosService.deleteEmpleado(id).subscribe({
        next: () =>
        {
          this.fetchEmpleados();
          this.deletingId = 0;
          this.isDeleting = false;
        },
        error: (err) =>
        {
          this.showError(err);
          this.deletingId = 0;
          this.isDeleting = false;
        },
      });
    }
    else
    {
      this.toast.warning('Ya hay una operación en curso', { id: 'delete' });
    }
  }

  private showError(error: any)
  {
    console.error(error);
    this.toast.error(`Error: ${error.error.message ?? 'Desconocido'}`, {id: 'error'});
  }
}
