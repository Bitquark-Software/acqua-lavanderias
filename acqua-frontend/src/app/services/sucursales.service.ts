/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service.service';
import { HotToastService } from '@ngneat/hot-toast';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../environments/develop';
import { Sucursal, SucursalResponse } from '../dtos/sucursal';

@Injectable({
  providedIn: 'root',
})
export class SucursalesService
{

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
    private httpClient: HttpClient,
  )
  {
    //
  }

  fetchSucursales(page?: number): Observable<SucursalResponse>
  {
    const url = page ? `${API_URL}/sucursales?page=${page}` : `${API_URL}/sucursales`;
    return this.httpClient.get<SucursalResponse>(url, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Obteniendo sucursales...',
        success: () => 'Sucursales encontradas',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
    );
  }

  registrarSucursal(sucursal: Partial<Sucursal>)
  {
    return this.httpClient.post<Sucursal>(`${API_URL}/sucursales`, {
      nombre: sucursal.nombre,
    }, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Registrando sucursal...',
        success: () => 'Sucursal registrada',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
    );
  }
}
