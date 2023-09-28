/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service.service';
import { HttpClient } from '@angular/common/http';
import { TicketStats } from '../dtos/ticket-stats';
import { API_URL } from '../environments/develop';
import { ReporteStats, UsuariosReporteStats } from '../dtos/reporte-stats';

@Injectable({
  providedIn: 'root',
})
export class StatsService
{
  subpath = 'stats';
  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
  )
  {
    //
  }

  getStatsForTicketId(id: number)
  {
    return this.httpClient.get<TicketStats>(
      `${API_URL}/${this.subpath}/tracks/${id}`,
      { headers: this.authService.getHeaders() },
    );
  }

  getStatsIngresos(start?: string, end?: string)
  {
    let url = `${API_URL}/${this.subpath}/ingresos`;

    if(start && end)
    {
      url = `${API_URL}/${this.subpath}/ingresos?fecha_inicio=${start}&fecha_fin=${end}`;
    }

    return this.httpClient.get<ReporteStats>(url, { headers: this.authService.getHeaders() });
  }

  getClientesStats(start?: string, end?: string)
  {
    let url = `${API_URL}/${this.subpath}/clientes`;

    if(start && end)
    {
      url = `${API_URL}/${this.subpath}/clientes?fecha_inicio=${start}&fecha_fin=${end}`;
    }

    return this.httpClient.get<UsuariosReporteStats>(url, { headers: this.authService.getHeaders() });
  }
}
