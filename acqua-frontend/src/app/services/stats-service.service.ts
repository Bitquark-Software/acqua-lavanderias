/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { TicketStats } from '../dtos/ticket-stats';
import { API_URL } from '../environments/develop';
import { PDFReporteStats, ReporteStats, UsuariosReporteStats } from '../dtos/reporte-stats';
import { Observable } from 'rxjs';

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

  getDataForPDFReport(start?: string, end?: string)
  {
    let url = `${API_URL}/${this.subpath}/reporte-general-ventas`;

    if(start && end)
    {
      url = `${API_URL}/${this.subpath}/reporte-general-ventas?fecha_inicio=${start}&fecha_fin=${end}`;
    }
    console.log('========= this.authService.getHeaders() ========');
    console.log(this.authService.getHeaders());

    return this.httpClient.get<PDFReporteStats>(url, { headers: this.authService.getHeaders() });
  }

  getReportPDF(start?: string, end?: string): Observable<string>
  {
    let url = `${API_URL}/${this.subpath}/reporte-general-ventas-pdf`;
    const body = { fecha_inicio: start, fecha_fin: end };

    if(start && end)
    {
      url = `${API_URL}/${this.subpath}/reporte-general-ventas-pdf`;
      return this.httpClient.post<string>(url, body, { headers: this.authService.getHeaders() });
    }

    return this.httpClient.post<string>(url, {}, { headers: this.authService.getHeaders() });
  }

}
