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

  getAllCorteCaja(): Observable<CorteCajaResponseGet<CorteCaja>>
  {
    return this.httpClient.get(`${API_URL}/gestion-caja`, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.handleNotifications('Obteniendo corte(s) de caja...'),
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
      this.handleNotifications('Creando corte de caja...'),
    );
  }

  updateCorteCaja(id_caja: number, monto_cierre: number): Observable<CorteCajaResponsePut>
  {
    return this.httpClient.put(`${API_URL}/gestion-caja/${id_caja}`, {
      monto_cierre,
    }, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.handleNotifications('Actualizando corte de caja...'),
    );
  }

  deleteCorteCaja(id_caja: number, codigoadmin: string): Observable<void | CorteCajaResponseDelete>
  {
    return this.httpClient.delete(`${API_URL}/gestion-caja/${id_caja}`, {
      headers: this.authService.getHeaders(),
      body: { codigoadmin: codigoadmin },
    }).pipe(
      this.handleNotifications('Eliminando corte de caja...'),
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
      this.handleNotifications('Obteniendo ganancias...'),
    );
  }

  private handleNotifications(message: string): any
  {
    return (source: Observable<any>): Observable<any> =>
    {
      return source.pipe(
        this.toast.observe({
          loading: 'Procesando...',
          success: () => message,
          error: (e) => `Error: ${e.error.error ?? 'Error desconocido'}`,
        }),
      );
    };
  }
}