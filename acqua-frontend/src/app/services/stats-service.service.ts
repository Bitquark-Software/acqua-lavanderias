/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service.service';
import { HttpClient } from '@angular/common/http';
import { TicketStats } from '../dtos/ticket-stats';
import { API_URL } from '../environments/develop';

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
}
