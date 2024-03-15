/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { Sucursal, SucursalResponse } from 'src/app/dtos/sucursal';
import { SucursalesService } from 'src/app/services/sucursales.service';

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.component.html',
  styleUrls: ['./sucursales.component.scss'],
})
export class SucursalesComponent
{
  sucursalesResponse!: SucursalResponse;
  sucursales: Sucursal[] = [];

  constructor(
    private sucursalService: SucursalesService,
  )
  {
    this.fetchSucursales();
  }

  fetchSucursales(page?: number)
  {
    this.sucursalService.fetchSucursales(page).subscribe(
      {
        next: (response) =>
        {
          this.sucursalesResponse = response;
          this.sucursales = response.data;
        },
      },
    );
  }

  fetchPreviousPage()
  {
    if(this.sucursalesResponse.prev_page_url)
    {
      const previousPageNumber = parseInt(this.sucursalesResponse.prev_page_url
        .charAt(this.sucursalesResponse.prev_page_url.length - 1));
      this.fetchSucursales(previousPageNumber);
    }
  }

  fetchNextPage()
  {
    if(this.sucursalesResponse.next_page_url)
    {
      const nextPageNumber = parseInt(this.sucursalesResponse.next_page_url
        .charAt(this.sucursalesResponse.next_page_url.length - 1));
      this.fetchSucursales(nextPageNumber);
    }
  }
}
