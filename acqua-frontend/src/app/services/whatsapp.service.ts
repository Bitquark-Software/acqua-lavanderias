import { Injectable } from '@angular/core';
import { AuthService } from './auth-service.service';
import { HotToastService } from '@ngneat/hot-toast';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../environments/develop';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
    private httpClient: HttpClient,
  ) { }

  sendPreflight(ticket_id: number){
    return this.httpClient.post(`${API_URL}/whatsapp/preflight`, {
      ticket_id
    }, {
      headers: this.authService.getHeaders(),
    });
  }

  sendMensajeConteo(ticket_id: number){
    return this.httpClient.post(`${API_URL}/whatsapp/enviar-mensaje-conteo`, {
      ticket_id
    }, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Enviando mensaje al cliente...',
        success: () => '¡WhatsApp enviado!',
        error: (e) => `Error: ${e ?? 'No se pudo notificar al cliente'}`,
      })
    );
  }

  sendMensajeEntrega(ticket_id: number){
    return this.httpClient.post(`${API_URL}/whatsapp/enviar-mensaje-entrega`, {
      ticket_id
    }, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Enviando mensaje al cliente...',
        success: () => '¡WhatsApp enviado!',
        error: (e) => `Error: ${e ?? 'No se pudo notificar al cliente'}`,
      })
    );
  }
}
