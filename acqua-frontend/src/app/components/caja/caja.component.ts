/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Categoria } from 'src/app/dtos/catalogo';
import { Cliente } from 'src/app/dtos/cliente';
import { Comentario } from 'src/app/dtos/comentario';
import { Servicio } from 'src/app/dtos/servicio';
import { Ubicacion } from 'src/app/dtos/ubicacion';
import { MetodoPago } from 'src/app/enums/MetodoPago.enum';
import { TipoCredito } from 'src/app/enums/TipoCredito.enum';
import { AuthService } from 'src/app/services/auth-service.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { TicketPreviewComponent } from '../tickets/ticket-preview/ticket-preview.component';
import { Ticket } from 'src/app/dtos/ticket';
import { TicketService } from 'src/app/services/ticket.service';
import { Sucursal } from 'src/app/dtos/sucursal';
import {
  ModalAgregarDireccionComponent,
} from '../clientes/modal-agregar-direccion/modal-agregar-direccion.component';
import * as moment from 'moment';

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.scss'],
})
export class CajaComponent
{
  isModalOpened = false;
  isSelectingCategorias = true;
  isSelectingServicios = false;

  categorias: Categoria[] = [];
  servicios: Servicio[] = [];

  // contenido del ticket (tabla)
  serviciosTicket: Servicio[] = [];

  // modales
  @ViewChild('modalRegistrarCliente') nuevoClienteDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('modalConfirmCancelarVenta') modalConfirmCancelarVenta!: ElementRef<HTMLDialogElement>;
  @ViewChild('cerrarVenta') modalCerrarVenta!: ElementRef<HTMLDialogElement>;
  @ViewChild('modalDirecciones') modalDirecciones!: ModalAgregarDireccionComponent;

  @ViewChild('ticketPreviewContainer',
    {
      read: ViewContainerRef,
    }) ticketPreviewContainer!: ViewContainerRef;

  ticketPreviewRef!: ComponentRef<TicketPreviewComponent>;

  // clientes
  nombreCliente = '';
  clienteDefault!: Cliente;
  clienteSeleccionado!: Cliente;
  coincidenciasClientes: Cliente[] = [];
  isClienteNotFoundPopupOpen = false;

  // Caja
  tabCursor = 0;
  tipoDeCredito: TipoCredito = TipoCredito.Credito;
  metodoPago: MetodoPago = MetodoPago.Efectivo;
  anticipo = 0;
  saldoPendiente = 0;
  recibido = 0;
  cambio = 0;
  total = 0;
  costoEnvio = 0;
  incluir_iva = false;
  numero_referencia = '';

  cursorEntrega = 0;
  idSucursal = 0;
  idDireccionEnvio = 0;
  fechaEstimadaEntrega: Date | string = '';

  stepFinalizarVenta = 0;

  // Nuevo Cliente
  nuevoClienteForm = this.fb.group({
    nombre: [this.nombreCliente, Validators.required],
    email: ['', Validators.email],
    telefono: ['', [ Validators.required, Validators.pattern('^[0-9]{10}$'), Validators.minLength(10) ]],
    agregarUbicacion: [true],
    nombreDireccion: ['', Validators.required],
    direccion: ['', Validators.required],
    colonia: ['', Validators.required],
    ciudad: ['', Validators.required],
    numero: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    codigoPostal:
      ['',
        [
          Validators.required,
          Validators.pattern('^[0-9]{5}$'),
          Validators.maxLength(5),
          Validators.minLength(5),
        ],
      ],
  });

  // Chat
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;
  chatText = '';
  chatHistory: Comentario[] = [];

  ticket!: Ticket;

  // Sucursales
  sucursales: Sucursal[] = [];

  constructor(
    private categoriasService: CategoriasService,
    private toastService: HotToastService,
    private authService: AuthService,
    private clientesService: ClientesService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketPreviewFactory: ComponentFactoryResolver,
    private ticketService: TicketService,
  )
  {
    this.route.queryParams.subscribe({
      next: (arr) =>
      {
        if(arr['cliente'])
        {
          this.clienteDefault = this.atob(arr['cliente']) as Cliente;
          if(this.clienteDefault)
          {
            this.nombreCliente = `${this.clienteDefault.id}:${this.clienteDefault.nombre}`;
            this.setCliente();
          }
        }
      },
    });
    this.categoriasService.fetchCatalogos().subscribe(
      {
        next: (response) => this.categorias = response.data as Categoria[],
      },
    );

    this.fetchSucursales();

    this.navigateToBottomOfChat();
  }

  fetchSucursales()
  {
    this.ticketService.getSucursales().subscribe({ next: (sucursales) => this.sucursales = sucursales });
  }

  inputServicioChange(e: Event)
  {
    const input = e.target as HTMLInputElement;

    if(input.value != null)
    {
      input.value = '';
    }
  }

  blurServiceInput(e: Event)
  {
    const input = e.target as HTMLInputElement;
    input.blur();
  }

  backToCategorias()
  {
    this.isSelectingServicios = false;
    this.servicios = [];
    this.isSelectingCategorias = true;
  }

  renderServiciosModal()
  {
    if(!this.isModalOpened)
    {
      const dialog = document.getElementById('modal_categorias_servicios') as HTMLDialogElement;

      if(dialog)
      {
        dialog.showModal();
      }
    }
  }

  renderServiciosPorCategoria(e: Event, idCategoria:number)
  {
    e.preventDefault();

    this.isSelectingCategorias = false;
    this.isSelectingServicios = true;

    this.categoriasService.fetchServiciosByCatalogoId(idCategoria).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (response: any) =>
      {
        this.servicios = response.servicios as Servicio[];
      },
    });
  }

  resetDialog()
  {
    const dialog = document.getElementById('modal_categorias_servicios') as HTMLDialogElement;

    if(dialog)
    {
      dialog.close();
    }
    this.isSelectingServicios = false;
    this.servicios = [];
    this.isSelectingCategorias = true;
  }

  setTabCursor(cursor: number)
  {
    this.tabCursor = cursor;
  }

  navigateToBottomOfChat()
  {
    if(this.chatContainer)
    {
      this.chatContainer.nativeElement.scrollTop =
      parseFloat(this.chatContainer.nativeElement.scrollHeight.toString()) + 100;
    }
  }

  sendComentario()
  {
    if(this.chatText.trim().length > 0)
    {
      this.chatHistory.push(
        {
          date: new Date().toISOString(),
          sender: this.authService.session?.datos.name ?? '',
          texto: this.chatText,
        },
      );
      this.chatText = '';
      setTimeout(() =>
      {
        this.navigateToBottomOfChat();
      }, 100);
    }
    else
    {
      this.chatText = '';
    }
  }

  private splitIdAndNombreCliente()
  {
    return {
      id: this.nombreCliente.split(':')[0],
      nombre: this.nombreCliente.split(':')[1],
    };
  }

  private forceBuscarCliente()
  {
    this.clientesService.buscarClientePorNombre(this.nombreCliente).subscribe(
      {
        next: (clientes: Cliente[]) =>
        {
          if(clientes.length > 0)
          {
            this.coincidenciasClientes = clientes;
            if(clientes.length == 0)
            {
              this.nombreCliente = `${clientes[0].id}:${clientes[0].nombre}`;
              this.setCliente();
            }
          }
        },
      },
    );
  }

  buscarCliente()
  {
    if(this.nombreCliente != null)
    {
      this.clientesService.buscarClientePorNombre(this.nombreCliente).subscribe(
        {
          next: (clientes: Cliente[]) =>
          {
            if(clientes.length > 0)
            {
              this.coincidenciasClientes = clientes;
            }
          },
        },
      );
    }
    else
    {
      const { nombre } = this.splitIdAndNombreCliente();
      this.clientesService.buscarClientePorNombre(nombre).subscribe(
        {
          next: (clientes: Cliente[]) =>
          {
            if(clientes.length > 0)
            {
              this.coincidenciasClientes = clientes;
            }
          },
        },
      );
    }
  }

  openNuevoClienteModal()
  {
    this.isClienteNotFoundPopupOpen = true;
    this.nuevoClienteDialog.nativeElement.showModal();
    this.listenForNuevoClienteModalToClose();
  }

  private listenForNuevoClienteModalToClose()
  {
    this.nuevoClienteDialog.nativeElement.addEventListener('close', () =>
    {
      this.isClienteNotFoundPopupOpen = false;
      this.nuevoClienteDialog.nativeElement.removeEventListener('close', () =>
      {
        //
      });
    });
  }

  closeNuevoClienteModal(event: Event)
  {
    event.preventDefault();
    this.nuevoClienteDialog.nativeElement.close();
  }

  registrarCliente(event: Event)
  {
    event.preventDefault();

    if(this.nuevoClienteForm.valid)
    {
      const ubicacion = this.agregarUbicacion.value ? new Ubicacion({
        ciudad: this.ciudad.value ?? '',
        codigo_postal: parseInt(this.codigoPostal.value ?? ''),
        colonia: this.colonia.value ?? '',
        calle: this.direccion.value ?? '',
        nombre_ubicacion: this.nombreDireccion.value ?? '',
        numero: parseInt(this.numero.value ?? ''),
      }) : null;
      const cliente = new Cliente({
        email: this.email.value ?? '',
        nombre: this.nombre.value ?? '',
        telefono: this.telefono.value ?? '',
        direccion: ubicacion ? [ubicacion] : [],
      });

      this.clientesService.registrarCliente(cliente);
      this.isClienteNotFoundPopupOpen = false;
      this.nombreCliente = cliente.nombre;
      this.nuevoClienteDialog.nativeElement.close();
      this.nuevoClienteForm.reset();
      this.forceBuscarCliente();
    }
    else
    {
      this.toastService.warning('El formulario tiene inconsistencias');
    }

  }

  setCliente()
  {
    const { id, nombre } = this.splitIdAndNombreCliente();
    console.log(id, nombre);
    if(id != null && nombre)
    {
      this.cursorEntrega = 0;
      const cliente = this.coincidenciasClientes.find(c => c.id?.toString() === id);
      if(cliente)
      {
        this.clientesService.fetchClienteById(cliente.id ?? 0).subscribe(
          {
            next: (clienteConDirecciones) =>
            {
              this.clienteSeleccionado = clienteConDirecciones;
            },
          },
        );
      }
      else if(this.clienteDefault)
      {
        this.clientesService.fetchClienteById(this.clienteDefault.id ?? 0).subscribe(
          {
            next: (clienteConDirecciones) =>
            {
              this.clienteSeleccionado = clienteConDirecciones;
            },
          },
        );
      }
    }
  }

  // getters para el form de registrar cliente
  get nombre()
  {
    return this.nuevoClienteForm.controls['nombre'];
  }
  get email()
  {
    return this.nuevoClienteForm.controls['email'];
  }
  get telefono()
  {
    return this.nuevoClienteForm.controls['telefono'];
  }
  get numero()
  {
    return this.nuevoClienteForm.controls['numero'];
  }
  get ciudad()
  {
    return this.nuevoClienteForm.controls['ciudad'];
  }
  get nombreDireccion()
  {
    return this.nuevoClienteForm.controls['nombreDireccion'];
  }
  get direccion()
  {
    return this.nuevoClienteForm.controls['direccion'];
  }
  get colonia()
  {
    return this.nuevoClienteForm.controls['colonia'];
  }
  get codigoPostal()
  {
    return this.nuevoClienteForm.controls['codigoPostal'];
  }

  get agregarUbicacion()
  {
    return this.nuevoClienteForm.controls['agregarUbicacion'];
  }

  // Items para la tabla
  addServicio(servicio: Servicio)
  {
    if(servicio.clave_servicio)
    {
      const index = this.existeServicio(servicio.clave_servicio);

      if(index < 0)
      {
        servicio.cantidad = servicio.cantidad_minima;
        servicio.subtotal = servicio.cantidad_minima * servicio.importe;
        this.serviciosTicket.push(servicio);
        this.resetDialog();
      }
      else
      {
        this.serviciosTicket[index].cantidad = (this.serviciosTicket[index].cantidad ?? 0) + 1;
        this.serviciosTicket[index].subtotal =
          (this.serviciosTicket[index].cantidad ?? 1) * this.serviciosTicket[index].importe;
      }

      this.recalcularTotal();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changeCantidadServicio(claveServicio: string, event: any)
  {
    const index = this.existeServicio(claveServicio);
    if(index >= 0)
    {
      const newValue = event.target.value ?? 1;

      if(newValue >= this.serviciosTicket[index].cantidad_minima)
      {
        const importe = parseFloat(newValue) * this.serviciosTicket[index].importe;
        this.serviciosTicket[index].subtotal = parseFloat(importe.toFixed(2));

        this.recalcularTotal();
      }
      else
      {
        const cantMinima = this.serviciosTicket[index].cantidad_minima;
        this.serviciosTicket[index].cantidad = cantMinima;
        this.serviciosTicket[index].subtotal = cantMinima * this.serviciosTicket[index].importe;

        this.toastService.warning(
          `La cantidad mínima para este servicio es de ${this.serviciosTicket[index].cantidad_minima}
        `);

        this.recalcularTotal();
      }
    }
  }

  deleteServicioTicket(claveServicio: string)
  {
    const index = this.existeServicio(claveServicio);
    if(index >= 0)
    {
      this.serviciosTicket.splice(index, 1);
      this.recalcularTotal();
    }
  }

  recalcularTotal()
  {
    let tempTotal = 0;
    this.serviciosTicket.forEach((s) =>
    {
      tempTotal += parseFloat(s.subtotal?.toString() ?? '1');
    });

    tempTotal += parseFloat(this.costoEnvio.toString());
    this.total = parseFloat(tempTotal.toFixed(2));

    if(this.metodoPago == MetodoPago.Tarjeta || this.metodoPago == MetodoPago.Transferencia)
    {
      this.recibido = this.anticipo;
    }

    if(this.tipoDeCredito === TipoCredito.Credito)
    {
      this.recalcularInputsCredito();
    }

    if(this.tipoDeCredito === TipoCredito.Contado)
    {
      this.recalcularInputsContado();
    }
  }

  private recalcularSaldoPendiente()
  {
    if(this.anticipo >= 0 && this.anticipo <= this.total)
    {
      this.saldoPendiente = this.total - this.anticipo;
    }
    else
    {
      if(this.anticipo > this.total)
      {
        this.toastService.warning(
          `El anticipo es mayor que el total del servicio: ${'$'} ${this.total}`);
      }
      this.anticipo = 0;
      this.saldoPendiente = 0;
    }
  }

  private recalcularRecibidoYCambioParaCredito()
  {
    if(typeof this.recibido === 'number')
    {
      if(this.recibido >= this.anticipo)
      {
        const cambio = this.recibido - this.anticipo;
        this.cambio = parseFloat(cambio.toFixed(2));
      }
      else
      {
        this.toastService.warning(`El importe recibido es menor al anticipo: ${this.anticipo}`);
        this.recibido = 0;
        this.cambio = 0;
      }
    }
    else
    {
      this.toastService.warning('No es un valor válido');
      this.recibido = 0;
      this.cambio = 0;
    }
  }

  private recalcularRecibidoYCambioParaContado()
  {
    if(typeof this.recibido === 'number')
    {
      if(this.recibido >= this.total)
      {
        const cambio = this.recibido - this.total;
        this.cambio = parseFloat(cambio.toFixed(2));
      }
      else
      {
        this.toastService.warning(`El importe recibido es menor al total: ${this.total}`);
        this.recibido = 0;
        this.cambio = 0;
      }
    }
    else
    {
      this.toastService.warning('No es un valor válido');
      this.recibido = 0;
      this.cambio = 0;
    }
  }

  recalcularInputsCredito()
  {
    if(typeof this.anticipo === 'number')
    {
      if(parseFloat(this.anticipo.toString()) > 0)
      {
        if(this.total > 0)
        {
          this.recalcularSaldoPendiente();
        }
        else
        {
          this.anticipo = 0;
          this.recalcularSaldoPendiente();
        }
      }
      else
      {
        this.anticipo = 0;
        this.recalcularSaldoPendiente();
      }
    }
    else
    {
      this.toastService.warning('Valor no permitido');
      this.anticipo = 0;
      this.recalcularSaldoPendiente();
    }

    // Recibido y cambio cuando es a credito
    if(this.anticipo > 0)
    {
      this.recalcularRecibidoYCambioParaCredito();
    }
    else
    {
      this.recibido = 0;
      this.cambio = 0;
    }
  }

  recalcularInputsContado()
  {
    if(typeof this.recibido === 'number')
    {
      if(parseFloat(this.recibido.toString()) > 0)
      {
        if(this.total > 0)
        {
          this.recalcularRecibidoYCambioParaContado();
        }
        else
        {
          this.recibido = 0;
          this.recalcularRecibidoYCambioParaContado();
        }
      }
      else
      {
        this.toastService.warning('Recuerda que el monto recibido tiene que ser mayor a cero pesos');
        this.recibido = 0;
        this.recalcularRecibidoYCambioParaContado();
      }
    }
    else
    {
      this.toastService.warning('Valor no permitido');
      this.recibido = 0;
      this.recalcularRecibidoYCambioParaContado();
    }

    // Recibido y cambio cuando es a credito
    if(this.recibido > 0)
    {
      this.recalcularRecibidoYCambioParaContado();
    }
    else
    {
      this.recibido = 0;
      this.cambio = 0;
    }
  }

  shouldEnableFinalizarVenta()
  {
    if(this.tipoDeCredito === TipoCredito.Credito)
    {
      if(this.cursorEntrega == 0)
      {
        return (
          this.total > 0 &&
          this.clienteSeleccionado != null &&
          this.serviciosTicket.length >= 1 &&
          this.anticipo >= 0 &&
          this.idSucursal != 0 &&
          (this.recibido >= 0 && this.recibido >= this.anticipo)
        );
      }
      else if(this.cursorEntrega == 1)
      {
        return (
          this.total > 0 &&
          this.costoEnvio > 0 &&
          this.clienteSeleccionado != null &&
          this.serviciosTicket.length >= 1 &&
          this.idDireccionEnvio != 0 &&
          this.anticipo >= 0 &&
          (this.recibido >= 0 && this.recibido >= this.anticipo)
        );
      }
      else
      {
        return false;
      }
    }
    else if(this.tipoDeCredito === TipoCredito.Contado)
    {
      if(this.cursorEntrega == 0)
      {
        return (
          this.total > 0 &&
          this.clienteSeleccionado != null &&
          this.serviciosTicket.length >= 1 &&
          this.idSucursal != 0 &&
          this.recibido >= this.total
        );
      }
      else if(this.cursorEntrega == 1)
      {
        return (
          this.total > 0 &&
          this.costoEnvio > 0 &&
          this.clienteSeleccionado != null &&
          this.idDireccionEnvio != 0 &&
          this.serviciosTicket.length >= 1 &&
          this.recibido >= this.total
        );
      }
      else
      {
        return false;
      }
    }
    else
    {
      return false;
    }
  }

  private existeServicio(claveServicio: string)
  {
    return this.serviciosTicket.findIndex((s) => s.clave_servicio === claveServicio);
  }

  confirmClearCaja()
  {
    if(this.modalConfirmCancelarVenta)
    {
      this.modalConfirmCancelarVenta.nativeElement.showModal();
    }
  }

  clearCaja()
  {
    this.serviciosTicket = [];
    this.total = 0;
    this.tipoDeCredito = TipoCredito.Credito;
    this.anticipo = 0;
    this.saldoPendiente = 0;
    this.cambio = 0;
    this.clienteSeleccionado = null as unknown as Cliente;
    this.nombreCliente = '';
    this.coincidenciasClientes = [];
    this.chatHistory = [];
    this.cursorEntrega = 0;
    this.idSucursal = 0;
    this.idDireccionEnvio = 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reRenderUbicacionesForm(event: any)
  {
    const checked = event.target.checked;
    this.nuevoClienteForm = this.fb.group({
      nombre: [this.nombre.value, Validators.required],
      email: [this.email.value, Validators.email],
      telefono:
        [
          this.telefono.value,
          [ Validators.required, Validators.pattern('^[0-9]{10}$'), Validators.minLength(10) ],
        ],
      agregarUbicacion: [checked],
      nombreDireccion: ['', checked ? [Validators.required] : []],
      direccion: ['', checked ? [Validators.required] : []],
      colonia: ['', checked ? [Validators.required] : []],
      ciudad: ['', checked ? [Validators.required] : []],
      numero: [
        '',
        checked ?
          [Validators.required, Validators.pattern('^[0-9]+$')]
          :
          [ Validators.pattern('^[0-9]+$') ]],
      codigoPostal:
        ['',
          checked ?
            [
              Validators.required,
              Validators.pattern('^[0-9]{5}$'),
              Validators.maxLength(5),
              Validators.minLength(5),
            ]
            :
            [
              Validators.pattern('^[0-9]{5}$'),
              Validators.maxLength(5),
              Validators.minLength(5),
            ],
        ],
    });
  }

  atob(base64: string)
  {
    return JSON.parse(atob(base64));
  }

  switchMetodoEntrega(cursor:number)
  {
    if(!this.clienteSeleccionado)
    {
      this.cursorEntrega = 0;
      this.renderNoUbicacionesAlert('Para habilitar esta opción primero selecciona a un cliente');
      return;
    }

    if(this.clienteSeleccionado)
    {
      if(!this.clienteSeleccionado.direccion?.length && cursor == 1)
      {
        this.modalDirecciones.openModal();
        // modal de agregar aqui
        return;
      }
    }
    this.cursorEntrega = cursor;
  }

  stepCompra(step: number)
  {
    if(this.numero_referencia.trim().length == 0)
    {
      this.toastService.warning(
        'El número de referencia/confirmación es requerido', { id: 'invalid-input' });
    }
    else
    {
      this.stepFinalizarVenta = step ?? 1;
      this.modalCerrarVenta.nativeElement.close();
      this.finalizarCompra();
    }
  }

  finalizarCompra()
  {
    if(this.metodoPago == MetodoPago.Efectivo)
    {
      this.stepFinalizarVenta = 1;
    }

    this.modalCerrarVenta.nativeElement.show();

    if(this.stepFinalizarVenta == 1)
    {
      const tempTicket = {
        id_cliente: this.clienteSeleccionado.id,
        envio_domicilio: this.cursorEntrega == 1,
        id_direccion: this.cursorEntrega == 1 ? this.idDireccionEnvio : null,
        id_sucursal: this.cursorEntrega == 0 ? this.idSucursal : null,
        incluye_iva: this.incluir_iva,
        tipo_credito: this.tipoDeCredito,
        metodo_pago: this.metodoPago,
        total: this.total,
        anticipo: this.anticipo,
        restante: this.saldoPendiente,
        comentarios: this.chatHistory,
        fecha_entrega: this.fechaEstimadaEntrega,
      } as Ticket;

      this.modalCerrarVenta.nativeElement.show();

      setTimeout(() =>
      {
        this.ticketPreviewContainer.clear();

        const ticketPreviewFactory =
        this.ticketPreviewFactory.resolveComponentFactory(TicketPreviewComponent);
        const ticketPreviewRef = this.ticketPreviewContainer.createComponent(ticketPreviewFactory);
        ticketPreviewRef.instance.ticket = tempTicket;
        ticketPreviewRef.instance.serviciosTicket = this.serviciosTicket;
        ticketPreviewRef.instance.setServiciosTicket(this.serviciosTicket);
        ticketPreviewRef.instance.setAnticipo(this.anticipo);
        ticketPreviewRef.instance.setIncluyeIva(this.incluir_iva);
        ticketPreviewRef.instance.setSaldoPendiente(this.saldoPendiente);
        ticketPreviewRef.instance.setTipoCompra(this.tipoDeCredito);
        ticketPreviewRef.instance.setTotal(this.total);
        ticketPreviewRef.instance.setCambio(this.cambio);
        ticketPreviewRef.instance.setRecibido(this.recibido);
        ticketPreviewRef.instance.setMetodoPago(this.metodoPago);
        ticketPreviewRef.instance.setCliente(this.clienteSeleccionado);
        ticketPreviewRef.instance.setTipoEntrega(this.cursorEntrega == 1 ? 'ENVIO' : 'SUCURSAL');
        ticketPreviewRef.instance.setTicket(tempTicket);
        ticketPreviewRef.instance.setAtendio(this.authService.session?.datos.name ?? '');
        ticketPreviewRef.instance.setUbicacionEnvio(
          this.clienteSeleccionado.direccion?.find((d) => d.id === this.idDireccionEnvio),
        );
        this.ticketPreviewRef = ticketPreviewRef;
      }, 1000);
    }
  }

  renderNoUbicacionesAlert(message: string)
  {
    this.toastService.warning(message);
  }

  setupPreviewForServicio(event: Event)
  {
    event.preventDefault();
    const tempTicket = {
      id_cliente: this.clienteSeleccionado.id,
      envio_domicilio: this.cursorEntrega == 1,
      id_direccion: this.cursorEntrega == 1 ? this.idDireccionEnvio : null,
      id_sucursal: this.cursorEntrega == 0 ? this.idSucursal : null,
      incluye_iva: this.incluir_iva,
      tipo_credito: this.tipoDeCredito,
      metodo_pago: this.metodoPago,
      total: this.total,
      anticipo: this.anticipo,
      restante: this.saldoPendiente,
      comentarios: this.chatHistory,
      fecha_entrega: this.fechaEstimadaEntrega,
    } as Ticket;

    this.modalCerrarVenta.nativeElement.show();

    this.ticketPreviewContainer.clear();

    const ticketPreviewFactory =
    this.ticketPreviewFactory.resolveComponentFactory(TicketPreviewComponent);
    const ticketPreviewRef = this.ticketPreviewContainer.createComponent(ticketPreviewFactory);
    ticketPreviewRef.instance.ticket = tempTicket;
    ticketPreviewRef.instance.serviciosTicket = this.serviciosTicket;
    ticketPreviewRef.instance.setServiciosTicket(this.serviciosTicket);
    ticketPreviewRef.instance.setAnticipo(this.anticipo);
    ticketPreviewRef.instance.setIncluyeIva(this.incluir_iva);
    ticketPreviewRef.instance.setSaldoPendiente(this.saldoPendiente);
    ticketPreviewRef.instance.setTipoCompra(this.tipoDeCredito);
    ticketPreviewRef.instance.setTotal(this.total);
    ticketPreviewRef.instance.setCambio(this.cambio);
    ticketPreviewRef.instance.setRecibido(this.recibido);
    ticketPreviewRef.instance.setMetodoPago(this.metodoPago);
    ticketPreviewRef.instance.setCliente(this.clienteSeleccionado);
    ticketPreviewRef.instance.setTipoEntrega(this.cursorEntrega == 1 ? 'ENVIO' : 'SUCURSAL');
    ticketPreviewRef.instance.setTicket(tempTicket);
    ticketPreviewRef.instance.setAtendio(this.authService.session?.datos.name ?? '');
    ticketPreviewRef.instance.setUbicacionEnvio(
      this.clienteSeleccionado.direccion?.find((d) => d.id == this.idDireccionEnvio),
    );
    this.ticketPreviewRef.instance.esTicketCliente = false;
    this.ticketPreviewRef.instance.setTipoTicket(false);
    this.ticketPreviewRef = ticketPreviewRef;

    setTimeout(() =>
    {
      this.printServicio(event);
    }, 500);
  }

  setupPreviewForCliente(event: Event)
  {
    event.preventDefault();
    const tempTicket = {
      id_cliente: this.clienteSeleccionado.id,
      envio_domicilio: this.cursorEntrega == 1,
      id_direccion: this.cursorEntrega == 1 ? this.idDireccionEnvio : null,
      id_sucursal: this.cursorEntrega == 0 ? this.idSucursal : null,
      incluye_iva: this.incluir_iva,
      tipo_credito: this.tipoDeCredito,
      metodo_pago: this.metodoPago,
      total: this.total,
      anticipo: this.anticipo,
      restante: this.saldoPendiente,
      comentarios: this.chatHistory,
      fecha_entrega: this.fechaEstimadaEntrega,
    } as Ticket;

    this.modalCerrarVenta.nativeElement.show();

    this.ticketPreviewContainer.clear();

    const ticketPreviewFactory =
    this.ticketPreviewFactory.resolveComponentFactory(TicketPreviewComponent);
    const ticketPreviewRef = this.ticketPreviewContainer.createComponent(ticketPreviewFactory);
    ticketPreviewRef.instance.ticket = tempTicket;
    ticketPreviewRef.instance.serviciosTicket = this.serviciosTicket;
    ticketPreviewRef.instance.setServiciosTicket(this.serviciosTicket);
    ticketPreviewRef.instance.setAnticipo(this.anticipo);
    ticketPreviewRef.instance.setIncluyeIva(this.incluir_iva);
    ticketPreviewRef.instance.setSaldoPendiente(this.saldoPendiente);
    ticketPreviewRef.instance.setTipoCompra(this.tipoDeCredito);
    ticketPreviewRef.instance.setTotal(this.total);
    ticketPreviewRef.instance.setCambio(this.cambio);
    ticketPreviewRef.instance.setRecibido(this.recibido);
    ticketPreviewRef.instance.setMetodoPago(this.metodoPago);
    ticketPreviewRef.instance.setCliente(this.clienteSeleccionado);
    ticketPreviewRef.instance.setTicket(tempTicket);
    ticketPreviewRef.instance.setTipoEntrega(this.cursorEntrega == 1 ? 'ENVIO' : 'SUCURSAL');
    ticketPreviewRef.instance.setAtendio(this.authService.session?.datos.name ?? '');
    ticketPreviewRef.instance.setUbicacionEnvio(
      this.clienteSeleccionado.direccion?.find((d) => d.id == this.idDireccionEnvio),
    );
    this.ticketPreviewRef.instance.esTicketCliente = true;
    this.ticketPreviewRef.instance.setTipoTicket(true);
    this.ticketPreviewRef = ticketPreviewRef;

    setTimeout(() =>
    {
      this.printCliente(event);
    }, 500);
  }

  printCliente(event: Event)
  {
    event.preventDefault();

    const newWindow = window.open('', '_blank');

    if(newWindow)
    {
      newWindow.document.write(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>TICKET DEL CLIENTE</title>
          </head>

          <body>
            ${this.ticketPreviewRef.location.nativeElement.outerHTML}
          </body>

          <style>
            @page { size:  auto; margin: 0px; }
            * {
              font-size: 12px;
              font-family: "Times New Roman";
            }
          
            td,
            th,
            tr,
            table {
              border-top: 1px solid black;
              border-collapse: collapse;
            }
          
            td.description,
            th.description {
              width: 75px;
              max-width: 75px;
            }
          
            td.quantity,
            th.quantity {
              width: 40px;
              max-width: 40px;
              word-break: break-all;
            }
          
            td.price,
            th.price {
              width: 40px;
              max-width: 40px;
              word-break: break-all;
            }
          
            .centered {
              text-align: center;
              align-content: center;
              font-weight: bold;
            }
          
            .ticket {
              width: 155px;
              max-width: 155px;
            }
          
            img {
              max-width: inherit;
              width: inherit;
            }
          
            @media print {
              .hidden-print,
              .hidden-print * {
                display: none !important;
              }
            }

            .qrcodeImage {
              display: flex;
              flex: 1;
            }
            
            /* Add custom styles here */
            .center {
              display: flex;
              flex: 1;
              justify-content: center;
            }
          </style>
        </html> 
        `);
      newWindow.document.close();
      newWindow.onload = () =>
      {
        newWindow.print();
      };
    }
  }

  printServicio(event: Event)
  {
    event.preventDefault();

    const newWindow = window.open('', '_blank');

    if(newWindow)
    {
      newWindow.document.write(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>TICKET DE SERVICIO</title>
          </head>

          <body>
            ${this.ticketPreviewRef.location.nativeElement.outerHTML}
          </body>

          <style>
            @page { size:  auto; margin: 0px; }
            * {
              font-size: 12px;
              font-family: "Times New Roman";
            }
          
            td,
            th,
            tr,
            table {
              border-top: 1px solid black;
              border-collapse: collapse;
            }
          
            td.description,
            th.description {
              width: 75px;
              max-width: 75px;
            }
          
            td.quantity,
            th.quantity {
              width: 40px;
              max-width: 40px;
              word-break: break-all;
            }
          
            td.price,
            th.price {
              width: 40px;
              max-width: 40px;
              word-break: break-all;
            }
          
            .centered {
              text-align: center;
              align-content: center;
              font-weight: bold;
            }
          
            .ticket {
              width: 155px;
              max-width: 155px;
            }
          
            img {
              max-width: inherit;
              width: inherit;
            }
          
            @media print {
              .hidden-print,
              .hidden-print * {
                display: none !important;
              }
            }

            .qrcodeImage {
              display: flex;
              flex: 1;
            }
            
            /* Add custom styles here */
            .center {
              display: flex;
              flex: 1;
              justify-content: center;
            }
          </style>
        </html> 
        `);
      newWindow.document.close();
      newWindow.onload = () =>
      {
        newWindow.print();
      };
    }
  }

  saveTicket()
  {
    this.ticket = {
      id_cliente: this.clienteSeleccionado.id,
      envio_domicilio: this.cursorEntrega == 1,
      id_direccion: this.cursorEntrega == 1 ? this.idDireccionEnvio : null,
      id_sucursal: this.cursorEntrega == 0 ? this.idSucursal : null,
      incluye_iva: this.incluir_iva,
      tipo_credito: this.tipoDeCredito,
      metodo_pago: this.metodoPago,
      total: this.total,
      anticipo: this.anticipo,
      restante: this.saldoPendiente,
      fecha_entrega: moment(this.fechaEstimadaEntrega).format('YYYY-MM-DD HH:mm:ss'),
      numero_referencia: this.numero_referencia,
    } as Ticket;

    const loadingToast = this.toastService.loading('Creando ticket');

    this.ticketService.registrarTicket(this.ticket, this.serviciosTicket).subscribe({
      next: (ticketResponse: any) =>
      {
        loadingToast.close();
        this.chatHistory.forEach(c =>
        {
          if(!c.id)
          {
            this.ticketService.agregarComentario(c, ticketResponse.data.id);
          }
        });
        this.toastService.success('¡Ticket creado!');
        this.clearCaja();
      },
      error: (err) =>
      {
        loadingToast.close();
        this.toastService.error(`${err.error.message ?? 'No se pudo crear el ticket' }`);
      },
    });
  }

  closeModalCerrarVenta()
  {
    this.stepFinalizarVenta = 0;
    this.modalCerrarVenta.nativeElement.close();
  }

  setIvaCheckbox(event: any)
  {
    const value = event.target.checked as boolean;
    this.incluir_iva = value;
  }

  checkFechaEntrega(event: any)
  {
    const d = new Date(`${event.target.value}T00:00:00`);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d > yesterday)
    {
      this.fechaEstimadaEntrega = event.target.value;
    }
    else
    {
      this.fechaEstimadaEntrega = '';
    }
  }

  handleMetodoPagoChange()
  {
    switch (this.metodoPago)
    {
    case MetodoPago.Tarjeta:
      if (this.tipoDeCredito == TipoCredito.Credito)
      {
        this.recibido = this.anticipo;
      }
      else
      {
        this.recibido = this.total;
      }
      break;

    case MetodoPago.Transferencia:
      if (this.tipoDeCredito == TipoCredito.Credito)
      {
        this.recibido = this.anticipo;
      }
      else
      {
        this.recibido = this.total;
      }
      break;

    default:
      this.recibido = 0;
      break;
    }
  }

  onDireccionAgregadaEvent()
  {
    console.log('EVENTO...');
    this.setCliente();
    this.cursorEntrega = 0;
  }
}
