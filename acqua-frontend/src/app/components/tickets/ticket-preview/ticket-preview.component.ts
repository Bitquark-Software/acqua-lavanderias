import { Component } from '@angular/core';
import { Ticket } from 'src/app/dtos/ticket';
import { APP_SERVICE_URL } from 'src/app/environments/develop';

@Component({
  selector: 'app-ticket-preview',
  templateUrl: './ticket-preview.component.html',
  styleUrls: ['./ticket-preview.component.scss'],
})
export class TicketPreviewComponent
{
  ticket!: Ticket;
  ticketURL = '';

  constructor()
  {
    //
    this.ticketURL = `${APP_SERVICE_URL}ticket/${this.ticket ? this.ticket.id : 1}`;
  }
}
