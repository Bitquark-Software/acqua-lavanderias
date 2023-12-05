/* eslint-disable no-unused-vars */
import { Component, ElementRef } from '@angular/core';
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
  componentParent!: ElementRef<HTMLDialogElement>;

  constructor(
    private ticketService: TicketService,
    private fb: FormBuilder,
    private toast: HotToastService,
  )
  {
    //
  }

  setParentComponent(component: ElementRef<HTMLDialogElement>)
  {
    this.componentParent = component;
  }

  setTicket(ticket: Ticket)
  {
    this.ticket = ticket;
    this.formPagos = this.getFormValidationForCashPaymentType();
    this.subscribeToFormChangesInCashPaymentType();
  }

  private getFormValidationForCashPaymentType()
  {
    return this.fb.group({
      monto: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(this.ticket.restante ?? 1),
        Validators.pattern(/^[0-9]+$/)],
      ],
      cantidadRecibida: ['', [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^[0-9]+$/),
      ]],
      cantidadDevuelta: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^[0-9]+$/),
      ]],
      referencia: [''],
    });
  }

  private getFormValidationForCardPaymentType()
  {
    return this.fb.group({
      monto: [''],
      cantidadRecibida: [''],
      cantidadDevuelta: [''],
      referencia: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(25),
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ]],
    });
  }

  private subscribeToFormChangesInCashPaymentType()
  {
    this.formPagos.controls['monto'].valueChanges.subscribe(() =>
    {
      this.actualizarDevolucionCambio();
    });
    this.formPagos.controls['cantidadRecibida'].valueChanges.subscribe(() =>
    {
      this.actualizarDevolucionCambio();
    });
  }

  get monto()
  {
    return this.formPagos.controls['monto'];
  }

  get cantidadRecibida()
  {
    return this.formPagos.controls['cantidadRecibida'];
  }

  get cantidadDevuelta()
  {
    return this.formPagos.controls['cantidadDevuelta'];
  }

  get referencia()
  {
    return this.formPagos.controls['referencia'];
  }

  actualizarDevolucionCambio()
  {
    const anticipo_cliente = this.monto.value;
    const cantidad_recibida = this.cantidadRecibida.value;
    const devolucion_cambio = this.calcularDevolucionCambio(anticipo_cliente, cantidad_recibida);
    this.formPagos.controls['cantidadDevuelta'].setValue(devolucion_cambio);
  }

  calcularDevolucionCambio(anticipo_cliente = 0, cantidad_recibida = 0): number | null
  {
    if(anticipo_cliente > 0 && cantidad_recibida > 0)
    {
      const devolucionCambio = cantidad_recibida - anticipo_cliente;
      if(devolucionCambio >= 0)
      {
        return devolucionCambio;
      }
    }
    return null;
  }

  changeMetodoPago(metodoPago: string)
  {
    this.metodoPago = metodoPago as MetodoPago;
    if(this.metodoPago == MetodoPago.Tarjeta || this.metodoPago == MetodoPago.Transferencia)
    {
      this.formPagos = this.getFormValidationForCardPaymentType();
    }
    else
    {
      this.formPagos = this.getFormValidationForCashPaymentType();
      this.subscribeToFormChangesInCashPaymentType();
    }
  }

  agregarMonto()
  {
    if(!this.isLoading)
    {
      this.isLoading = true;
      const anticipo = parseFloat(this.monto.value);
      this.ticketService.registrarAnticipo(
        this.ticket.id, anticipo, this.referencia.value, this.metodoPago).subscribe({
        next: () =>
        {
          this.isLoading = false;
          this.toast.success('Anticipo registrado');
          this.componentParent.nativeElement.close();
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

  reImprimirTickets()
  {
    // eslint-disable-next-line max-len
    // TODO: Renderizar el componente de ticket preview, agregando los botones para imprimir ambos tickets
  }

}
