/* eslint-disable no-unused-vars */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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

  // clientes
  @ViewChild('modalRegistrarCliente') nuevoClienteDialog!: ElementRef<HTMLDialogElement>;
  nombreCliente = '';
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

  // Nuevo Cliente
  nuevoClienteForm = this.fb.group({
    nombre: [this.nombreCliente, Validators.required],
    email: ['', Validators.email],
    telefono: ['', [ Validators.required, Validators.pattern('^[0-9]{10}$'), Validators.minLength(10) ]],
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

  constructor(
    private categoriasService: CategoriasService,
    private toastService: HotToastService,
    private authService: AuthService,
    private clientesService: ClientesService,
    private fb: FormBuilder,
  )
  {
    this.categoriasService.fetchCatalogos().subscribe(
      {
        next: (response) => this.categorias = response.data as Categoria[],
      },
    );

    this.navigateToBottomOfChat();
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
          text: this.chatText,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buscarCliente()
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shouldPopupNuevoClienteModalOnChange()
  {
    const { id, nombre } = this.splitIdAndNombreCliente();

    if(this.coincidenciasClientes.length === 0 && nombre != null)
    {
      this.openNuevoClienteModal();
    }
    else if(nombre != null && this.coincidenciasClientes.length > 0)
    {
      const cliente = this.coincidenciasClientes.find((c) => c.id?.toString() === id);
      if(cliente)
      {
        this.clienteSeleccionado = cliente;
      }
      else
      {
        this.toastService.error('Problemas al seleccionar un cliente');
      }
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
      const ubicacion = new Ubicacion({
        ciudad: this.ciudad.value ?? '',
        codigoPostal: parseInt(this.codigoPostal.value ?? ''),
        colonia: this.colonia.value ?? '',
        direccion: this.direccion.value ?? '',
        nombre: this.nombreDireccion.value ?? '',
        numero: parseInt(this.numero.value ?? ''),
      });
      const cliente = new Cliente({
        email: this.email.value ?? '',
        nombre: this.nombre.value ?? '',
        telefono: this.telefono.value ?? '',
        ubicaciones: [ubicacion],
      });

      this.clientesService.registrarCliente(cliente);
      this.isClienteNotFoundPopupOpen = false;
      this.nombreCliente = cliente.nombre;
      this.nuevoClienteDialog.nativeElement.close();
      this.nuevoClienteForm.reset();
      this.buscarCliente();
    }
    else
    {
      this.toastService.warning('El formulario tiene inconsistencias');
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
        this.serviciosTicket[index].subtotal = parseInt(newValue) * this.serviciosTicket[index].importe;

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
    this.total = tempTotal;

    if(this.tipoDeCredito === TipoCredito.Credito)
    {
      this.recalcularInputsCredito();
    }
  }

  private recalcularSaldoPendiente()
  {
    if(this.anticipo > 0 && this.anticipo <= this.total)
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
        this.cambio = this.recibido - this.anticipo;
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
        this.toastService.warning('Recuerda que el anticipo tiene que ser mayor a cero pesos');
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

  shouldEnableFinalizarVenta()
  {
    if(this.tipoDeCredito === TipoCredito.Credito)
    {
      return (
        this.total > 0 &&
        this.clienteSeleccionado != null &&
        this.serviciosTicket.length >= 1 &&
        this.anticipo >= 0 &&
        (this.recibido > 0 && this.recibido >= this.anticipo)
      );
    }
    else if(this.tipoDeCredito === TipoCredito.Contado)
    {
      return (
        this.total > 0 &&
        this.clienteSeleccionado != null &&
        this.serviciosTicket.length >= 1 &&
        this.recibido >= this.total
      );
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
}
