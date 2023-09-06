/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service.service';
import { HotToastService } from '@ngneat/hot-toast';
import { HttpClient } from '@angular/common/http';
import { Ticket, TicketResponse } from '../dtos/ticket';
import { Comentario } from '../dtos/comentario';
import { API_URL } from '../environments/develop';
import { Sucursal } from '../dtos/sucursal';
import { Servicio } from '../dtos/servicio';
import { Prenda } from '../dtos/prenda-ticket';

@Injectable({
  providedIn: 'root',
})
export class TicketService
{

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
    private httpClient: HttpClient,
  )
  {
    //
  }

  registrarTicket(ticket: Partial<Ticket>, servicios: Servicio[])
  {
    return this.httpClient.post(`${API_URL}/tickets`,
      {
        ...ticket,
        servicios,
      },
      {
        headers: this.authService.getHeaders(),
      },
    );
  }

  agregarComentario(comentario: Comentario, id_ticket: number)
  {
    this.httpClient.post(`${API_URL}/comentario`, {
      texto: comentario.texto,
      id_ticket,
    },
    { headers: this.authService.getHeaders() },
    ).subscribe({ next: () => { this.toast.success('Comentario agregado'); } });
  }

  getSucursales()
  {
    return this.httpClient.get<Sucursal[]>(`${API_URL}/sucursales`, {
      headers: this.authService.getHeaders(),
    });
  }

  getTodosLosTickets()
  {
    return this.httpClient.get<TicketResponse>
    (`${API_URL}/tickets`, { headers: this.authService.getHeaders() });
  }

  getTicketById(id:number)
  {
    return this.httpClient.get<Ticket>
    (`${API_URL}/tickets/${id}`, { headers: this.authService.getHeaders() });
  }

  getTodasLasPrendas()
  {
    return this.httpClient.get<Prenda[]>
    (`${API_URL}/prendas`, { headers: this.authService.getHeaders() });
  }
}
