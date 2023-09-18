/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Ticket } from 'src/app/dtos/ticket';
import { MetodoPago } from 'src/app/enums/MetodoPago.enum';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-registrar-pago',
  templateUrl: './registrar-pago.component.html',
  styleUrls: ['./registrar-pago.component.scss'],
})
export class RegistrarPagoComponent
{
  ticket!: Ticket;
  formPagos: FormGroup = this.fb.group({});
  isLoading = false;
  metodoPago: MetodoPago = MetodoPago.Efectivo;

  constructor(
    private ticketService: TicketService,
    private fb: FormBuilder,
    private toast: HotToastService,
  )
  {
    //
  }

  setTicket(ticket: Ticket)
  {
    this.ticket = ticket;
    this.formPagos = this.fb.group({
      monto: ['', [Validators.required, Validators.min(1), Validators.max(this.ticket.restante ?? 0)]],
    });
  }

  reImprimirTickets()
  {
    // eslint-disable-next-line max-len
    // TODO: Renderizar el componente de ticket preview, agregando los botones para imprimir ambos tickets
  }

  get monto()
  {
    return this.formPagos.controls['monto'];
  }

  agregarMonto()
  {
    if(!this.isLoading)
    {
      console.log(this.ticket.anticipo);
      this.isLoading = true;
      this.ticket.anticipo = parseFloat(
        this.ticket.anticipo?.toString() ?? '0') + parseFloat(this.monto.value);
      this.ticketService.actualizarTicket(this.ticket).subscribe({
        next: () =>
        {
          this.isLoading = false;
          this.toast.success('Anticipo registrado');
          // Cerrar el modal
        },
        error: (err) =>
        {
          console.error(err);
          this.toast.error('No se pudo registrar el anticipo');
        },
      });
    }
  }

  changeMetodoPago(metodoPago: string)
  {
    this.metodoPago = metodoPago as MetodoPago;
  }

}
