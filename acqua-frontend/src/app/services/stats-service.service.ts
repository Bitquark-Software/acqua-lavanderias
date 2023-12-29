/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { TicketStats } from '../dtos/ticket-stats';
import { API_URL } from '../environments/develop';
import { PDFReporteStats, ReporteStats, UsuariosReporteStats } from '../dtos/reporte-stats';

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

  getReportPDF(start?: string, end?: string)
  {
    let url = `${API_URL}/${this.subpath}/reporte-general-ventas-pdf`;
    const body = { fecha_inicio: start, fecha_fin: end };

    const my_token_empty = '';
    /*
    //let my_token = "
    eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZTVmMjBmMDFmYzIyNzA5Y
    WZkMTcxNzBjYjhiZjc1Y2QzYWI0ZGRkODA1ZTkyMjM0YTM1Y2Y2NmZkNjljMDA4OWQyMDA1MDRkMjcwNmI
    4ODAiLCJpYXQiOjE3MDM3NjYzMTQuOTYwMjk0LCJuYmYiOjE3MDM3NjYzMTQuOTYwMzEzLCJleHAiOjE3M
    zUzODg3MTQuNDcwMzc2LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.DlJw72W4u_zeH5VGc8OkO1yZzfZlps9
    utCieIzzj29YCVxUil_sDFphsGthyeW0U0HVG0wYWHBuQrnHu7HNmSmcfdOwutLLpbv9S_VFODZvJrCrnK
    1cevwvkh63akpQLzSnhW3MY74-YGGer47wqalmp2mY6YLjgghUVxwGqlrfzoxFJQ-0IqNN9e4l7p-R3Ocq
    KmxVwKBF_9k5oU-RW1vOZCu2QGGbk7sLxY9PDcv3X0AUDLdIFtDA0Wjks35qwqAiN6bfJsFiG28TW578Wb
    RPqdWyKWosvEaJTP31StFQj8kX2NiCYEHGbTOeyLBxUJTk7nm7R5LIHX7NruRFjnjGRmm4hJ85dZvMpkyO
    DwQc7lv08ajVZkc1l2i6uJEiPddCd13Yzh9AOL4F5SgmU5CRfa-pdSpdsf-O_LgU7naqsaIXaz1ok_Cqk-
    ri7hcc7R1_x8VnZJsI0s_g5Snlwpyb9Cn_cShOUxjRmLLcHKMAwqsnlTcpLMyx6i0KXwPMvmlarBVQdEAY
    SqATHazigRgPYbtaNputWYO9o_0RgobbxwTAAiFvAwEkH6vBuGw2zw5emg73SFXf8lPljBM8AtcLH9f0fT
    m6iKjx-0Udf_oZoofBpttLYMMzxboHIPUKIWnnonj7nY8JlHiusRs6fmNz4Zy2Zn0DOMh6Or-FHQ5U
    ";
  */
    const headerss = {
      'Access-Control-Allow-Origin': '*',
      Authorization: `Bearer ${my_token_empty}`,
      'responseType': 'blob',
    };

    if(start && end)
    {
      url = `${API_URL}/${this.subpath}/reporte-general-ventas-pdf`;
      return this.httpClient.post<Blob>(url, body, { headers: headerss});
    }

    return this.httpClient.post<Blob>(url, {}, { headers: headerss });
  }

}
