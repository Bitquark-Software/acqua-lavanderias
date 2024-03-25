/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service.service';
import { HotToastService } from '@ngneat/hot-toast';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

  fetchSucursalById(id: number): Observable<Sucursal>
  {
    return this.httpClient.get<Sucursal>(`${API_URL}/sucursales/${id}`, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Obteniendo datos de la sucursañ...',
        success: () => 'Sucursal encontrada',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
      map( response => response as Sucursal),
    );
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

  actualizarSucursal(id: number, sucursal: Partial<Sucursal>)
  {
    return this.httpClient.put(
      `${API_URL}/sucursales/${id}`,
      {
        nombre: sucursal.nombre,
      },
      {
        headers: this.authService.getHeaders(),
      },
    ).pipe(
      this.toast.observe({
        loading: 'Actualizando sucursal...',
        success: () => 'Sucursal actualizada',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
      map(response => response as Sucursal),
    );
  }

  agregarHorario(sucursal_id: number, dias: string, horaApertura:string, horaCierre: string)
  {
    return this.httpClient.post(
      `${API_URL}/horarios`,
      {
        sucursal_id,
        dias,
        horario: `${horaApertura}:00 a ${horaCierre}:00`,
      },
      {
        headers: this.authService.getHeaders(),
      },
    ).pipe(
      this.toast.observe({
        loading: 'Agregando horario...',
        success: () => 'Horario agregado',
        error: (e) => `Error: ${e.mensaje ?? 'Desconocido'}`,
      }));
  }

  eliminarHorario(horario_id: number)
  {
    return this.httpClient.delete(
      `${API_URL}/horarios/${horario_id}`,
      {
        headers: this.authService.getHeaders(),
      },
    ).pipe(
      this.toast.observe({
        loading: 'Eliminando horario...',
        success: () => 'Horario eliminado',
        error: (e) => `Error: ${e.mensaje ?? 'Desconocido'}`,
      }));
  }
}
