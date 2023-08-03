/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cliente } from 'src/app/dtos/cliente';
import { StatusTicket, Ticket } from 'src/app/dtos/ticket';
import { MetodoPago } from 'src/app/enums/MetodoPago.enum';
import { TipoCredito } from 'src/app/enums/TipoCredito.enum';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
})
export class TicketsComponent
{
  busquedaCliente = '';
  tickets: Ticket[] = [
    {
      id: 1,
      cliente: new Cliente({
        nombre: 'Fernando',
        telefono: '9611003141',
      }),
      created_at: new Date().toLocaleDateString('es-MX'),
      envio_domicilio: false,
      id_cliente: 1,
      incluye_iva: false,
      metodo_pago: MetodoPago.Efectivo,
      status: StatusTicket.Creado,
      tipo_credito: TipoCredito.Contado,
      total: 300,
      vencido: false,
    },
    {
      id: 1,
      cliente: new Cliente({
        nombre: 'Fernando',
        telefono: '9611003141',
      }),
      created_at: new Date().toLocaleDateString('es-MX'),
      envio_domicilio: false,
      id_cliente: 1,
      incluye_iva: false,
      metodo_pago: MetodoPago.Efectivo,
      status: StatusTicket.Lavado,
      tipo_credito: TipoCredito.Contado,
      total: 310,
      vencido: false,
    },
    {
      id: 1,
      cliente: new Cliente({
        nombre: 'Fernando',
        telefono: '9611003141',
      }),
      created_at: new Date().toLocaleDateString('es-MX'),
      envio_domicilio: false,
      id_cliente: 1,
      incluye_iva: false,
      metodo_pago: MetodoPago.Efectivo,
      status: StatusTicket.Reconteo,
      tipo_credito: TipoCredito.Contado,
      total: 320,
      vencido: false,
    },
    {
      id: 1,
      cliente: new Cliente({
        nombre: 'Fernando',
        telefono: '9611003141',
      }),
      created_at: new Date().toLocaleDateString('es-MX'),
      envio_domicilio: false,
      id_cliente: 1,
      incluye_iva: false,
      metodo_pago: MetodoPago.Efectivo,
      status: StatusTicket.Planchado,
      tipo_credito: TipoCredito.Contado,
      total: 320,
      vencido: false,
    },
    {
      id: 1,
      cliente: new Cliente({
        nombre: 'Fernando',
        telefono: '9611003141',
      }),
      created_at: new Date().toLocaleDateString('es-MX'),
      envio_domicilio: false,
      id_cliente: 1,
      incluye_iva: false,
      metodo_pago: MetodoPago.Efectivo,
      status: StatusTicket.Entrega,
      tipo_credito: TipoCredito.Contado,
      total: 320,
      vencido: false,
    },
  ];

  constructor(
    private route: ActivatedRoute,
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
          }
        }
      },
    });
  }

  atob(base64: string)
  {
    return JSON.parse(atob(base64));
  }
}
