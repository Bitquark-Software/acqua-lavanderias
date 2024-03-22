import { Injectable } from '@angular/core';
import { API_URL } from '../environments/develop';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth-service.service';
import { AdminCodeResponseGet, AdminCodeResponsePostPut } from '../dtos/admin-code';
import { HotToastService } from '@ngneat/hot-toast';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AdminCodesService
{

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private toast: HotToastService,
  )
  {
    //
  }

  fetchAdminCodes(page?: number): Observable<AdminCodeResponseGet>
  {
    const url = page ? `${API_URL}/codigos-admin?page=${page}`: `${API_URL}/codigos-admin`;
    return this.httpClient.get<AdminCodeResponseGet>(url, {
      headers: this.authService.getHeaders(),
    })
      .pipe(
        this.toast.observe({
          loading: 'Obteniendo codigo(s)...',
          success: () => 'Codigo(s) obtenido(s)',
          error: (e) => `Error ${e.error.error ?? ' al obtener los códigos'}`,
        }),
        map( response => response as AdminCodeResponseGet),
      );
  }

  createAdminCode(reason: string): Observable<AdminCodeResponsePostPut>
  {
    return this.httpClient.post(`${API_URL}/codigos-admin`, {
      motivo: reason,
    },
    {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Creando código...',
        success: () => 'Código creado',
        error: (e) => `Error ${e.error.error ?? ' al crear el código'}`,
      }),
      map( response => response as AdminCodeResponsePostPut),
    );
  }

  updateAdminCodeById(id_code: number, id_ticket: number): Observable<AdminCodeResponsePostPut>
  {
    return this.httpClient.put(`${API_URL}/codigos-admin/${id_code}`, {
      id_ticket,
    }, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Actualizando código',
        success: () => 'Código actualizado',
        error: (e) => `Error ${e.error.error ?? ' al actualizar el código'}`,
      }),
      map( response => response as AdminCodeResponsePostPut),
    );
  }

}
