import { Component } from '@angular/core';
import { Cliente } from 'src/app/dtos/cliente';
import { Servicio } from 'src/app/dtos/servicio';
import { Sucursal } from 'src/app/dtos/sucursal';
import { Ticket } from 'src/app/dtos/ticket';
import { Ubicacion } from 'src/app/dtos/ubicacion';
import { MetodoPago } from 'src/app/enums/MetodoPago.enum';
import { TipoCredito } from 'src/app/enums/TipoCredito.enum';
import { APP_SERVICE_URL } from 'src/app/environments/develop';

@Component({
  selector: 'app-ticket-preview',
  templateUrl: './ticket-preview.component.html',
  styleUrls: ['./ticket-preview.component.scss'],
})
export class TicketPreviewComponent
{
  ticket: Ticket = {} as Ticket;
  serviciosTicket: Servicio[] = [];
  ticketURL = '';
  ticketURLCliente = 'https://drive.google.com/file/d/1tAdeOqLWAnnHxH6sGpvCnPBa_9LC6ICq/view?pli=1';
  subtotal = 0;
  total = 0;
  calculo_iva = 0;
  incluye_iva = false;
  anticipo = 0;
  saldoPendiente = 0;
  cambio = 0;
  recibido = 0;
  tipoCompra!: TipoCredito;
  metodoPago!: MetodoPago;
  cliente!: Cliente;
  tipoEntrega!: string;
  sucursal!: Sucursal;
  ubicacionEnvio!: Ubicacion;
  esTicketCliente = false;
  montoImpuestos = 0;
  atendio!: string;
  tarifaEnvioDomicilio = 0;

  constructor()
  {
    this.ticketURL = `${APP_SERVICE_URL}ticket/${this.ticket ? this.ticket.id : 1}`;
  }

  private calculaMontoImpuestos()
  {
    const iva = this.total*0.16;
    this.subtotal = this.total;
    this.montoImpuestos = parseFloat(iva.toFixed(2));
    this.total = this.subtotal + this.montoImpuestos;
    this.saldoPendiente = this.total - this.anticipo;
  }

  setTarifaEnvioADomicilio(monto: number)
  {
    this.tarifaEnvioDomicilio = monto;
  }

  setServiciosTicket(servicios: Servicio[])
  {
    this.serviciosTicket = servicios;
  }

  setTotal(total: number)
  {
    this.total = total;
    if(this.incluye_iva)
    {
      this.calculaMontoImpuestos();
    }
  }

  setCalculoIva(calculo_iva: number)
  {
    this.calculo_iva = calculo_iva;
  }

  setIncluyeIva(incluyeIva: boolean)
  {
    this.incluye_iva = incluyeIva;
  }

  setAnticipo(anticipo: number)
  {
    this.anticipo = anticipo;
  }

  setSaldoPendiente(saldoPendiente: number)
  {
    this.saldoPendiente = saldoPendiente;
    console.log('Saldo pendiente');
    console.log(saldoPendiente);
  }

  setTipoCompra(tipoCompra: TipoCredito)
  {
    this.tipoCompra = tipoCompra;
  }

  setMetodoPago(metodoPago: MetodoPago)
  {
    this.metodoPago = metodoPago;
  }

  setCambio(cambio: number)
  {
    this.cambio = cambio;
  }

  setRecibido(recibido: number)
  {
    this.recibido = recibido;
  }

  setCliente(cliente: Cliente)
  {
    this.cliente = cliente;
  }

  setTipoEntrega(tipo: string)
  {
    this.tipoEntrega = tipo;
  }

  setSucursal(sucursal: Sucursal)
  {
    this.sucursal = sucursal;
    console.log('sucursal => ', sucursal);
  }

  setTipoTicket(es_cliente: boolean)
  {
    this.esTicketCliente = es_cliente;
  }

  setUbicacionEnvio(ubicacion: Ubicacion | undefined)
  {
    if(ubicacion) this.ubicacionEnvio = ubicacion;
  }

  setTicket(ticket: Ticket)
  {
    this.ticket = ticket;
  }

  setAtendio(nombre: string)
  {
    this.atendio = nombre;
  }
}
