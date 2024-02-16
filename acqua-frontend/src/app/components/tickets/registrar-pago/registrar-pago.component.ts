/* eslint-disable no-unused-vars */
import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Subscription } from 'rxjs';
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
  private montoSub: Subscription | undefined;
  private cantidadRecibidaSub: Subscription | undefined;

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
        Validators.min(0.01),
        Validators.max(Number(this.ticket.restante)),
        Validators.pattern(/^\d+.?\d{0,2}$/),
      ]],
      cantidadRecibida: ['', [
        Validators.required,
        Validators.min(Number(this.monto)),
        Validators.pattern(/^\d+([0.5]?)*$/),
      ]],
      cantidadDevuelta: ['', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+.?\d{0,2}$/),
      ]],
      referencia: [''],
    });
  }

  private getFormValidationForCardPaymentType()
  {
    return this.fb.group({
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
    this.montoSub = this.formPagos.controls['monto'].valueChanges.subscribe(() =>
    {
      this.actualizarDevolucionCambio();
    });
    this.cantidadRecibidaSub = this.formPagos.controls['cantidadRecibida'].valueChanges.subscribe(() =>
    {
      this.actualizarDevolucionCambio();
    });
  }

  private unsubscribeToFormChangesInCashPaymentType()
  {
    if(this.montoSub)
    {
      this.montoSub.unsubscribe();
    }
    if(this.cantidadRecibidaSub)
    {
      this.cantidadRecibidaSub.unsubscribe();
    }
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

  private calcularDevolucionCambio(anticipo_cliente = 0, cantidad_recibida = 0): number | null
  {
    if(anticipo_cliente > 0 && cantidad_recibida > 0)
    {
      const devolucionCambio = Number((cantidad_recibida - anticipo_cliente).toFixed(2));
      if(devolucionCambio >= 0)
      {
        return this.calcularRedondeoCambio(devolucionCambio);
      }
    }
    return null;
  }

  private calcularRedondeoCambio(cambio: number): number
  {
    const redondeo:number = this.getNumberToRound(cambio);
    if(redondeo >= 0.41)
    {
      return Number((cambio-redondeo+0.5).toFixed(2));
    }
    else
    {
      return Number((cambio-redondeo).toFixed(2));
    }
  }

  private getNumberToRound(cantidad = 0): number
  {
    const modulo_cantidad:number = Number(cantidad.toFixed(2))%1;
    if(modulo_cantidad > 0.5)
    {
      return Number((modulo_cantidad-0.5).toFixed(2));
    }
    else
    {
      return Number(modulo_cantidad.toFixed(2));
    }
  }

  changeMetodoPago(metodoPago: string)
  {
    this.metodoPago = metodoPago as MetodoPago;
    if(metodoPago == MetodoPago.Tarjeta || metodoPago == MetodoPago.Transferencia)
    {
      // Esto evitará suscripciones acumulativas
      this.unsubscribeToFormChangesInCashPaymentType();
      this.formPagos = this.getFormValidationForCardPaymentType();
    }
    else
    {
      this.formPagos = this.getFormValidationForCashPaymentType();
      // Es necesario cuando el usuario alterno entre las opciones del método de pago
      this.subscribeToFormChangesInCashPaymentType();
    }
  }

  private agregarMonto(monto = 0, metodoPago: MetodoPago)
  {
    if(!this.isLoading)
    {
      this.isLoading = true;

      this.ticketService.registrarAnticipo(
        this.ticket.id, monto, this.referencia.value, metodoPago).subscribe({
        next: () =>
        {
          this.toast.success('Anticipo registrado');
          this.componentParent.nativeElement.close();
          this.isLoading = false;
          // Cerrar el modal
        },
        error: (err) =>
        {
          console.error(err);
          this.toast.error('No se pudo registrar el anticipo');
          this.isLoading = false;
        },
      });
    }
  }

  agregarMontoPorTipo()
  {
    if(this.metodoPago === MetodoPago.Efectivo)
    {
      this.agregarMonto(parseFloat(this.monto.value), this.metodoPago);
    }
    else if (this.metodoPago === MetodoPago.Tarjeta || this.metodoPago === MetodoPago.Transferencia)
    {
      this.agregarMonto(parseFloat(this.ticket.restante!.toString()), this.metodoPago);
    }
    else
    {
      this.toast.error('El metodo de pago no es correcto');
    }
  }

  reImprimirTickets()
  {
    // eslint-disable-next-line max-len
    // TODO: Renderizar el componente de ticket preview, agregando los botones para imprimir ambos tickets
  }

}
