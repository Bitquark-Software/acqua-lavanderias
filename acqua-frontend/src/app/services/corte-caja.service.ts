import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth-service.service';
import { API_URL } from '../environments/develop';
import { HotToastService } from '@ngneat/hot-toast';
import { Observable } from 'rxjs';
import {
  CorteCaja,
  CorteCajaResponseGet,
  CorteCajaResponsePost,
  CorteCajaResponsePut,
  CorteCajaResponseDelete,
  GananciasResponseGet,
} from '../dtos/corte-caja';

@Injectable({
  providedIn: 'root',
})

export class CorteCajaService
{
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private toast: HotToastService,
  )
  {
    //
  }

  fetchCorteCaja(page?: number): Observable<CorteCajaResponseGet<CorteCaja>>
  {
    const URL = page ? `${API_URL}/gestion-caja?page=${page}`: `${API_URL}/gestion-caja`;

    return this.httpClient.get(URL, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.handleNotifications('Obteniendo corte(s) de caja', 'Corte(s) de caja obtenidos'),
    );
  }

  createCorteCaja(idSucursal: number, monto: number, codigo: string): Observable<CorteCajaResponsePost>
  {
    return this.httpClient.post(`${API_URL}/gestion-caja`, {
      id_sucursal: idSucursal,
      monto_apertura: monto,
      codigoadmin: codigo,
    },
    {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.handleNotifications('Creando corte de caja', 'Corte de caja creado!'),
    );
  }

  updateCorteCaja(idCaja: number, monto: number): Observable<CorteCajaResponsePut>
  {
    return this.httpClient.put(`${API_URL}/gestion-caja/${idCaja}`, {
      monto_cierre: monto,
    }, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.handleNotifications('Actualizando corte de caja...', 'Corte de caja actualizada!'),
    );
  }

  forcedUpdateCorteCaja(idCaja: number, monto: number, codigo: string): Observable<CorteCajaResponsePut>
  {
    return this.httpClient.put(`${API_URL}/gestion-caja/${idCaja}`, {
      monto_cierre: monto,
      codigoadmin: codigo,
    }, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.handleNotifications('Actualizando corte de caja...', 'Corte de caja actualizada!'),
    );
  }

  deleteCorteCaja(idCaja: number, codigo: string): Observable<void | CorteCajaResponseDelete>
  {
    return this.httpClient.delete(`${API_URL}/gestion-caja/${idCaja}`, {
      headers: this.authService.getHeaders(),
      body: { codigoadmin: codigo },
    }).pipe(
      this.handleNotifications('Eliminando corte de caja...', 'Corte de caja eliminado'),
    );
  }

  getCorteCajaGanancias(idSucursal: number, idCajaAbierta: number): Observable<GananciasResponseGet>
  {
    return this.httpClient.post(`${API_URL}/gestion-caja-ganancias/`, {
      idSucursal,
      idCajaAbierta,
    }, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.handleNotifications('Obteniendo ganancias de caja...', 'Ganancias de caja obtenidas'),
    );
  }

  private handleNotifications(msg_loading: string, msg_success: string): any
  {
    return (source: Observable<any>): Observable<any> =>
    {
      return source.pipe(
        this.toast.observe({
          loading: msg_loading,
          success: () => msg_success,
          error: (e) => `Error: ${e.error.error ?? 'Error desconocido'}`,
        }),
      );
    };
  }
}