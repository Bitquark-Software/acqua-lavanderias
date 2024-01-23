/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service.service';
import { HotToastService } from '@ngneat/hot-toast';
import { HttpClient } from '@angular/common/http';
import { ReimpimirTicket, Ticket, TicketResponse } from '../dtos/ticket';
import { Comentario } from '../dtos/comentario';
import { API_URL } from '../environments/develop';
import { Sucursal } from '../dtos/sucursal';
import { Servicio } from '../dtos/servicio';
import { Prenda, PrendaTicket, PrendaTicketReponse } from '../dtos/prenda-ticket';
import { Proceso } from '../dtos/proceso';
import { Lavadora } from '../dtos/lavadora';
import { concatMap, from } from 'rxjs';
import { Secadora } from '../dtos/secadora';

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

  actualizarTicket(ticket: Ticket)
  {
    return this.httpClient.put(
      `${API_URL}/tickets/${ticket.id}`,
      { ...ticket },
      {
        headers: this.authService.getHeaders(),
      },
    );
  }

  registrarAnticipo(id_ticket: number, anticipo: number, numero_referencia: string, metodopago: string)
  {
    return this.httpClient.post(
      `${API_URL}/anticipoTickets`,
      { anticipo, numero_referencia, id_ticket, metodopago },
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
    return this.httpClient.get<ReimpimirTicket>
    (`${API_URL}/tickets/${id}`, { headers: this.authService.getHeaders() });
  }

  getTodasLasPrendas()
  {
    return this.httpClient.get<Prenda[]>
    (`${API_URL}/prendas`, { headers: this.authService.getHeaders() });
  }

  agregarPrendaAlTicket(id_prenda: number, id_ticket: number, total_inicial: number)
  {
    return this.httpClient.post<PrendaTicketReponse>(
      `${API_URL}/prendas_tickets`,
      {
        id_prenda,
        id_ticket,
        total_inicial,
      },
      {
        headers: this.authService.getHeaders(),
      },
    );
  }

  quitarPrendaDelTicket(prendaTicketId: number)
  {
    return this.httpClient.delete(
      `${API_URL}/prendas_tickets/${prendaTicketId}`,
      {
        headers: this.authService.getHeaders(),
      },
    );
  }

  registrarProceso(id_ticket: number, proceso: Proceso)
  {
    return this.httpClient.post(`${API_URL}/proceso-tickets`, {
      id_ticket,
      id_proceso: proceso.id,
    },
    { headers: this.authService.getHeaders() });
  }

  getTodosLosProcesos()
  {
    return this.httpClient.get<Proceso[]>(`${API_URL}/proceso`,
      {
        headers: this.authService.getHeaders(),
      });
  }

  updateProceso(id_proceso: number, id_lavadora?: number, id_secadora?: number)
  {
    return this.httpClient.put(
      `${API_URL}/proceso-tickets/${id_proceso}`,
      {
        id_lavadora,
        id_secadora,
      },
      { headers: this.authService.getHeaders() },
    );
  }

  agregarLavadoraSecadoraExtra(id_ticket: number, id_lavadora_secadora?: number)
  {
    return this.httpClient.post(`${API_URL}/lavadora-secadora-adicional`, {
      lavadora: id_lavadora_secadora,
      id_ticket,
    },
    { headers: this.authService.getHeaders() });
  }

  getLavadoras()
  {
    return this.httpClient.get<Lavadora[]>(
      `${API_URL}/lavadoras`, { headers: this.authService.getHeaders() });
  }

  getSecadoras()
  {
    return this.httpClient.get<Secadora[]>(
      `${API_URL}/secadoras`, { headers: this.authService.getHeaders() });
  }

  updatePrendasTicket(prendasTicket: PrendaTicket[])
  {
    const observablePrendasTickets = from(prendasTicket);
    return observablePrendasTickets.pipe(
      concatMap((ticketPrenda) =>
        this.httpClient.put(
          `${API_URL}/prendas_tickets/${ticketPrenda.id}`,
          { total_final: ticketPrenda.total_final },
          {
            headers: this.authService.getHeaders(),
          },
        ),
      ),
    );
  }
}
