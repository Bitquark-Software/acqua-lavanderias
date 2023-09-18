/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cliente } from 'src/app/dtos/cliente';
import { Ticket, TicketResponse } from 'src/app/dtos/ticket';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
})
export class TicketsComponent
{
  busquedaCliente = '';
  tickets: Ticket[] = [];
  ticketsCopy: Ticket[] = [];

  constructor(
    private route: ActivatedRoute,
    private ticketsService: TicketService,
  )
  {
    this.route.queryParams.subscribe({
      next: (arr) =>
      {
        if(arr['cliente'])
        {
          const cliente: Cliente = this.atob(arr['cliente']) as Cliente;
          if(cliente)
          {
            this.busquedaCliente = cliente.nombre;
            this.fetchTickets();
          }
        }
        else
        {
          this.fetchTickets();
        }
      },
    });
  }

  handleInputChange()
  {
    if(this.busquedaCliente.length > 0)
    {
      this.filtrarPorCliente();
    }
    else
    {
      this.tickets = this.ticketsCopy;
    }
  }

  private filtrarPorCliente()
  {
    this.tickets = this.ticketsCopy;
    const coincidencias = this.tickets.filter(
      (ticket) =>
        ticket.cliente.nombre.toLocaleLowerCase().includes(this.busquedaCliente.toLocaleLowerCase()) ||
        ticket.cliente.telefono?.includes(this.busquedaCliente) ||
        ticket.id.toString() == this.busquedaCliente) ?? [] as Ticket[];
    this.tickets = coincidencias;
  }

  fetchTickets()
  {
    this.ticketsService.getTodosLosTickets().subscribe({
      next: (response: TicketResponse) =>
      {
        const ticketsTemp = response.data;
        ticketsTemp.forEach(t =>
        {
          t.created_at = new Date(t.created_at).toLocaleString('es-MX');
        },
        );

        this.tickets = ticketsTemp;
        this.ticketsCopy = ticketsTemp;

        if(this.busquedaCliente) this.filtrarPorCliente();
      },
      error: (err) =>
      {
        console.log(err);
      },
    });
  }

  atob(base64: string)
  {
    return JSON.parse(atob(base64));
  }
}
