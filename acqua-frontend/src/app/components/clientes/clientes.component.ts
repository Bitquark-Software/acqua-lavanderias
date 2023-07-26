/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { Cliente, ClienteResponse } from 'src/app/dtos/cliente';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent
{
  clientesResponse!: ClienteResponse;
  clientes: Cliente[] = [];

  constructor(
    private clientesService: ClientesService,
  )
  {
    this.fetchClientes();
  }

  fetchClientes(page?: number)
  {
    this.clientesService.fetchClientes(page).subscribe(
      {
        next: (response) =>
        {
          this.clientesResponse = response;
          this.clientes = response.data;
        },
      },
    );
  }

  fetchPreviousPage()
  {
    if(this.clientesResponse.prev_page_url)
    {
      const previousPageNumber = parseInt(this.clientesResponse.prev_page_url
        .charAt(this.clientesResponse.prev_page_url.length - 1));
      this.fetchClientes(previousPageNumber);
    }
  }

  fetchNextPage()
  {
    if(this.clientesResponse.next_page_url)
    {
      const nextPageNumber = parseInt(this.clientesResponse.next_page_url
        .charAt(this.clientesResponse.next_page_url.length - 1));
      this.fetchClientes(nextPageNumber);
    }
  }

  eliminarCliente(id:number)
  {
    console.log('ID => ', id);
    if(id)
    {
      this.clientesService.eliminarCliente(id).subscribe({
        next: () =>
        {
          this.fetchClientes();
        },
      });
    }
  }
}
