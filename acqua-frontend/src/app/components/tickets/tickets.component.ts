/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente } from 'src/app/dtos/cliente';
import { Ticket, TicketResponse } from 'src/app/dtos/ticket';
import { TicketService } from 'src/app/services/ticket.service';
import { Proceso, ProcesosAcqua } from 'src/app/dtos/proceso';
import { HotToastService } from '@ngneat/hot-toast';

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
  PROCESOS_EXISTENTES: Proceso[] | undefined = [];

  constructor(
    private router: Router,
    private toast: HotToastService,
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
    this.fetchProcesos();
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

  pedidoCerrado(ticket: Ticket): boolean
  {
    if(Number(ticket.restante) === 0)
    {
      const proceso_entrega: Proceso | undefined = this.PROCESOS_EXISTENTES!.find(
        proceso => proceso.nombre === String(ProcesosAcqua.ENTREGA),
      );

      if(proceso_entrega != null || proceso_entrega != undefined)
      {
        const proceso_actual = ticket.procesos_ticket.find(
          proceso_ticket => proceso_ticket.id_proceso === proceso_entrega?.id,
        );
        if(proceso_actual != null || proceso_actual != undefined)
        {
          return proceso_actual!.timestamp_start !=null && proceso_actual!.timestamp_end != null;
        }
      }
    }
    return false;
  }

  fetchProcesos()
  {
    this.ticketsService.getTodosLosProcesos().subscribe({
      next: (procesos) =>
      {
        this.PROCESOS_EXISTENTES = procesos;
      },
      error: (err) =>
      {
        this.toast.error('Error CRÍTICO: No hay procesos dados de alta, contacte a los desarrolladores');
        this.router.navigate(['/']);
        console.log(err);
      },
    });
  }
}
