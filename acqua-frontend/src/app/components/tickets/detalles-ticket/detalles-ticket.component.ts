/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  ViewChild,
  ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Comentario } from 'src/app/dtos/comentario';
import { Lavadora } from 'src/app/dtos/lavadora';
import { Prenda, PrendaTicket } from 'src/app/dtos/prenda-ticket';
import { Proceso, ProcesoTicket, ProcesosAcqua, ResponseRegistrarProceso } from 'src/app/dtos/proceso';
import { ResponseLavadoraSecadoraExtra } from 'src/app/dtos/proceso';
import { Sucursal, SucursalResponse } from 'src/app/dtos/sucursal';
import { ReimpimirTicket, StatusTicket, Ticket } from 'src/app/dtos/ticket';
import { AuthService } from 'src/app/services/auth-service.service';
import { TicketService } from 'src/app/services/ticket.service';
import { RegistrarPagoComponent } from '../registrar-pago/registrar-pago.component';
import { Role } from 'src/app/enums/Role.enum';
import { TicketStats } from 'src/app/dtos/ticket-stats';
import { StatsService } from 'src/app/services/stats-service.service';
import { Secadora } from 'src/app/dtos/secadora';
import { TicketPreviewComponent } from '../ticket-preview/ticket-preview.component';
import { Servicio } from 'src/app/dtos/servicio';

@Component({
  selector: 'app-detalles-ticket',
  templateUrl: './detalles-ticket.component.html',
  styleUrls: ['./detalles-ticket.component.scss'],
})
export class DetallesTicketComponent
{
  isLoadingTicketPreview = true;
  isLoading = true;
  showDisplayError = false;
  ticketId!: number;
  ticket!: ReimpimirTicket;

  @ViewChild('comentariosModal') comentariosModal!: ElementRef<HTMLDialogElement>;

  @ViewChild('pagosModal') pagosModal!: ElementRef<HTMLDialogElement>;

  @ViewChild('reimprimirModal') reimprimirModal!: ElementRef<HTMLDialogElement>;

  @ViewChild('pagosContainer',
    {
      read: ViewContainerRef,
    }) pagosContainer!: ViewContainerRef;
  pagosContainerRef!: ComponentRef<RegistrarPagoComponent>;

  stepCursor = 0;
  cursorEntrega = 0;

  prendasTicket: PrendaTicket[] = [];
  serviciosTicket: Servicio[] = [];
  prendas: Prenda[] = [];

  prendasForm!: FormGroup;
  piezasText = 'Pieza';
  conteo = 0;
  reconteoOk = false;
  idLavadora!:number;
  idSecadora!:number;
  idLavadoraExtra:number | undefined;
  idSecadoraExtra:number | undefined;
  idProcLavadoraExtra!:number;
  idProcSecadoraExtra!:number;
  procLavadoraExtra!:ResponseLavadoraSecadoraExtra | null;
  procSecadoraExtra!:ResponseLavadoraSecadoraExtra | null;
  lavadoras: Lavadora[] = [];
  secadoras: Secadora[] = [];

  chatHistory: Comentario[] = [];
  chatForm!: FormGroup;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  // Proceso's logic
  PROCESOS_EXISTENTES: Proceso[] = [];
  currentProcesoTicket?: ProcesoTicket | null;

  idSucursalRecoleccion = 0;
  idUbicacionEnvio = 0;

  sucursales: Sucursal[] = [];

  userRole: Role | null = null;
  Role = Role;
  isLoadingStats = false;

  ticketStats!: TicketStats;

  // re-imprimir ticket
  @ViewChild('ticketPreviewContainer',
    {
      read: ViewContainerRef,
    }) ticketPreviewContainer!: ViewContainerRef;

  ticketPreviewRef!: ComponentRef<TicketPreviewComponent>;

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private pagosModalFactory: ComponentFactoryResolver,
    private statsService: StatsService,
    private ticketPreviewFactory: ComponentFactoryResolver,
  )
  {
    const ticketId = this.route.snapshot.params['id'];
    this.ticketId = ticketId;

    this.prendasForm = this.fb.group({
      prenda: ['', Validators.required],
      piezas: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]{1,3}$')]],
    });

    this.chatForm = this.fb.group({
      message: ['', Validators.required],
    });

    this.fetchProcesos();
    this.fetchTicketById();
    this.fetchPrendas();
    this.fetchSucursales();

    this.userRole = this.auth.session!.datos.role;
  }

  fetchSucursales()
  {
    this.ticketService.getSucursales().subscribe({
      next: (sucursales: SucursalResponse) =>
      {
        this.sucursales = sucursales.data;
      },
      error: (err) =>
      {
        this.toast.error('Error al obtener las sucursales');
        console.error(err);
      },
    });
  }

  fetchProcesos()
  {
    this.ticketService.getTodosLosProcesos().subscribe({
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

  fetchPrendas()
  {
    this.ticketService.getTodasLasPrendas().subscribe({
      next: (prendas) => this.prendas = prendas,
    });
  }

  fetchTicketById()
  {
    this.ticketService.getTicketById(this.ticketId).subscribe({
      next: (ticket) =>
      {
        this.ticket = ticket;
        this.ticket.created_at = new Date(ticket.created_at).toLocaleString('es-MX');
        setTimeout(() =>
        {
          this.handleStatus();
          this.populateChat();
          this.poupulatePrendasTicket();
          this.handleCurrentProceso();
          this.setCurrentProcesoTicket();
          this.handleStatus();
          this.ticket.servicios_ticket.forEach(st =>
          {
            this.serviciosTicket.push(
              {
                ...st.servicio,
                subtotal: parseFloat(st.servicio.importe.toString()) * st.kilos,
                cantidad: st.kilos,
              },
            );
          });
          this.isLoading = false;
        }, 0);
      },
      error: (err) =>
      {
        this.showDisplayError = true;
        console.log(err);
        setTimeout(() =>
        {
          this.isLoading = false;
        }, 0);
      },
    });
  }

  addPrendaToTable()
  {
    const idPrenda = this.prenda.value;
    const piezas = this.piezas.value;

    const indexFound = this.prendasTicket.findIndex(p => p.id_prenda === idPrenda);

    if(indexFound >= 0)
    {
      const previousValue = this.prendasTicket[indexFound].total_inicial ?? 0;
      this.prendasTicket[indexFound].total_inicial =
        parseInt(previousValue.toString()) + parseInt(piezas);
      this.prendasForm.reset();
      this.recalcularConteo();
      return;
    }

    this.ticketService.agregarPrendaAlTicket(idPrenda, this.ticketId, piezas).subscribe(
      {
        next: (result) =>
        {
          this.prendasTicket.push(result.data);
          this.recalcularConteo();
        },
      },
    );
    this.prendasForm.reset();
    this.recalcularConteo();
  }

  deletePrendaFormTicket(prendaTicketId: number)
  {
    if(this.confirmAction('¿Desea elminar la prenda del ticket? \n Esta acción no podrá revertirse.'))
    {
      this.isLoading = true;
      this.ticketService.quitarPrendaDelTicket(prendaTicketId).subscribe({
        next: () => this.fetchTicketById(),
        error: (err) =>
        {
          this.isLoading = false;
          console.error(err);
        },
      });
    }
  }

  swtichPiezasText()
  {
    const piezas = this.piezas.value ?? '';
    const parsedPiezas = parseInt(piezas);

    if(piezas ==='')
    {
      this.piezasText = 'Pieza';
      return;
    }

    if(isNaN(parsedPiezas))
    {
      this.piezas.patchValue('');
      return;
    }

    if(parsedPiezas > 1)
    {
      this.piezasText = 'Piezas';
    }
    else
    {
      this.piezasText = 'Pieza';
    }
  }

  get piezas()
  {
    return this.prendasForm.controls['piezas'];
  }

  get prenda()
  {
    return this.prendasForm.controls['prenda'];
  }

  private recalcularConteo()
  {
    let newValue = 0;
    this.prendasTicket.forEach(p => { newValue += parseInt(p.total_inicial?.toString() ?? ''); });
    this.conteo = newValue;
  }

  nextStep()
  {
    switch(this.stepCursor)
    {
    // conteo inicial
    case 0:
      // update in DB
      this.isLoading = true;
      this.ticketService.updateProceso(this.currentProcesoTicket?.id ?? 0).subscribe({
        next: () =>
        {
          this.registrarProcesoLavado();
        },
        error: () => this.isLoading = false,
      });
      break;
    // Lavado
    case 1:
    {
      const procesos_de_lavado: ProcesoTicket[] = this.getTicketProcessesByName(ProcesosAcqua.LAVADO);
      if(procesos_de_lavado.length > 0)
      {
        this.isLoading = true;
        this.ticketService.updateProceso(this.currentProcesoTicket?.id ?? 0).subscribe({
          next: () =>
          {
            if(procesos_de_lavado.length > 1)
            {
              this.ticketService.updateProceso(this.idProcLavadoraExtra).subscribe({
                next: () =>
                {
                  this.registrarProcesoSecado();
                },
                error: () => this.isLoading = false,
              });
            }
            else
            {
              this.registrarProcesoSecado();
            }
          },
        });
      }
      else
      {
        this.toast.warning('No se ha seleccionado una lavadora');
      }
      break;
    }
    // Secado
    case 2:
      const procesos_de_secado: ProcesoTicket[] = this.getTicketProcessesByName(ProcesosAcqua.SECADO);
      if(procesos_de_secado.length > 0)
      {
        this.isLoading = true;
        this.ticketService.updateProceso(this.currentProcesoTicket?.id ?? 0).subscribe({
          next: () =>
          {
            if(procesos_de_secado.length > 1)
            {
              this.ticketService.updateProceso(this.idProcSecadoraExtra).subscribe({
                next: () =>
                {
                  this.registrarProcesoReconteo();
                },
                error: () => this.isLoading = false,
              });
            }
            else
            {
              this.registrarProcesoReconteo();
            }
          },
          error: (err) =>
          {
            this.isLoading = false;
            console.error(err);
          },
        });
      }
      else
      {
        this.toast.warning('No se ha seleccionado una secadora');
      }
      // TODO: Update proceso ticket y registrar reconteo
      break;
    // Reconteo
    case 3:
      this.isLoading = true;
      this.ticketService.updatePrendasTicket(this.prendasTicket).subscribe({
        next: () =>
        {
          this.ticketService.updateProceso(this.currentProcesoTicket?.id ?? 0).subscribe({
            next: () =>
            {
              this.registrarProcesoEntrega();
            },
            error: (err) =>
            {
              this.toast.error(err.message ?? 'Error al actualizar el ticket');
              console.error(err);
              this.isLoading = false;
            },
          });
        },
        error: (err) =>
        {
          this.toast.error('Error al actualizar el reconteo');
          console.error(err);
          this.isLoading = false;
        },
      });
      break;
    // Entrega
    case 4:
      this.isLoading = true;
      this.ticketService.updateProceso(this.currentProcesoTicket?.id ?? 0).subscribe(
        {
          next: () =>
          {
            this.stepCursor += 1;
            this.fetchTicketById();
          },
          error: (err) =>
          {
            console.error(err);
            this.toast.error('No se pudo finalizar el ticket');
          },
        },
      );
      break;
    default:
      this.stepCursor = 0;
    }
  }

  private registrarProcesoLavado()
  {
    const proceso_acqua = this.PROCESOS_EXISTENTES.find(
      p => p.nombre === ProcesosAcqua.LAVADO) as unknown as Proceso;
    this.registrarProcesosAcqua(this.ticket.id, proceso_acqua);
  }

  private registrarProcesoSecado()
  {
    const proceso_acqua = this.PROCESOS_EXISTENTES.find(
      p => p.nombre === ProcesosAcqua.SECADO) as unknown as Proceso;
    this.registrarProcesosAcqua(this.ticket.id, proceso_acqua);
  }

  private registrarProcesoReconteo()
  {
    const proceso_acqua = this.PROCESOS_EXISTENTES.find(
      p => p.nombre === ProcesosAcqua.RECONTEO) as unknown as Proceso;
    this.registrarProcesosAcqua(this.ticket.id, proceso_acqua);
  }

  private registrarProcesoEntrega()
  {
    const proceso_acqua = this.PROCESOS_EXISTENTES.find(
      p => p.nombre === ProcesosAcqua.ENTREGA) as unknown as Proceso;
    this.registrarProcesosAcqua(this.ticket.id, proceso_acqua);
  }

  private registrarProcesosAcqua(idTicket = 0, proceso_acqua: Proceso)
  {
    this.ticketService.registrarProceso(idTicket, proceso_acqua).subscribe({
      next: () =>
      {
        this.stepCursor+= 1;
        this.fetchTicketById();
      },
      error: (err) =>
      {
        this.toast.error(`Error: ${err.message ?? 'Desconocido'}`);
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private ask(message: string)
  {
    return window.confirm(message);
  }

  handleConteoFinal(prendaTicket: PrendaTicket)
  {
    if(prendaTicket.total_final != prendaTicket.total_inicial)
    {
      this.toast.warning(`El conteo final no coincide con el inicial: ${prendaTicket.total_inicial}`);
    }
    this.checkReconteo();
  }

  private checkReconteo()
  {
    this.prendasTicket.forEach(pt =>
    {
      if(pt.total_inicial != pt.total_final)
      {
        this.reconteoOk = false;
        return;
      }
      this.reconteoOk = true;
    });
  }

  switchMetodoEntrega(cursor: number)
  {
    if(cursor != this.cursorEntrega)
    {
      if(this.ticket.cliente.direccion?.length == 0)
      {
        this.toast.warning('El cliente no tiene direcciones guardadas. Vamos a registarle una');
      }
      else
      {
        this.cursorEntrega = cursor;
        this.ticket.envio_domicilio = cursor == 1;
        this.updateTicket();
      }
    }
  }

  changeIdSucursal(idSucursal: number)
  {
    this.ticket.id_sucursal = idSucursal;
    this.updateTicket();
  }

  changeIdUbicacion(idUbicacion: number)
  {
    this.ticket.id_direccion = idUbicacion;
    this.updateTicket();
  }

  private updateTicket()
  {
    this.isLoading = true;
    this.ticketService.actualizarTicket(this.ticket).subscribe(
      {
        next: () => this.fetchTicketById(),
        error: (err) =>
        {
          console.error(err);
          this.toast.error('Error al actualizar el ticket');
          this.isLoading = true;
        },
      },
    );
  }

  openCommentsDialog()
  {
    this.comentariosModal.nativeElement.show();
  }

  closeCommentsDialog()
  {
    this.comentariosModal.nativeElement.close();
  }

  replaceFormsubmit(event:Event)
  {
    event.preventDefault();
  }

  sendComentario(event?: Event)
  {
    if(event) event.preventDefault();
    if(this.message.value != '')
    {
      const comentario = {
        texto: this.message.value,
        sender: this.auth.session?.datos.name ?? 'UNKOWN',
        date: new Date().toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
      this.ticketService.agregarComentario(comentario, this.ticketId);
      this.chatHistory.push(comentario);
      this.chatForm.reset();
      setTimeout(() =>
      {
        this.navigateToBottomOfChat();
      }, 200);
    }
  }

  get message()
  {
    return this.chatForm.controls['message'];
  }

  navigateToBottomOfChat()
  {
    if(this.chatContainer)
    {
      this.chatContainer.nativeElement.scrollTop =
      parseFloat(this.chatContainer.nativeElement.scrollHeight.toString()) + 100;
    }
  }

  private handleStatus()
  {
    switch (this.ticket.status)
    {
    case StatusTicket.Creado:
      this.stepCursor = 0;
      break;
    case StatusTicket.Lavado:
      this.populateLavadoras();
      this.stepCursor = 1;
      break;
    case StatusTicket.Secado:
      this.populateSecadoras();
      this.stepCursor = 2;
      break;
    case StatusTicket.Reconteo:
      this.stepCursor = 3;
      break;
    case StatusTicket.Entrega:
      const procesoExistenteEntrega =
        this.PROCESOS_EXISTENTES.find((p) => p.nombre == ProcesosAcqua.ENTREGA);
      const procesoEntregado =
        this.ticket.procesos_ticket.find((p) => p.id_proceso == procesoExistenteEntrega?.id);
      if(procesoEntregado?.timestamp_start && procesoEntregado.timestamp_end)
      {
        this.stepCursor = 5;
      }
      else
      {
        this.stepCursor = 4;
      }
      break;
    }

  }

  private getTicketProcessesByName(process_name: ProcesosAcqua): ProcesoTicket[]
  {
    const proceso_acqua = this.PROCESOS_EXISTENTES.find((p) => p.nombre === process_name);
    const procesos: ProcesoTicket[] =
      this.ticket.procesos_ticket.filter((pt) => pt.id_proceso === proceso_acqua?.id) ?? null;
    return procesos;
  }

  private noExisteProcesoExtras(process_name: ProcesosAcqua): boolean
  {
    const procesos_extras: ProcesoTicket[] = this.getTicketProcessesByName(process_name);
    return procesos_extras.length <= 1;
  }

  private existeProcesoLavadoraExtra(): boolean
  {
    return !this.noExisteProcesoExtras(ProcesosAcqua.LAVADO);
  }

  private existeProcesoSecadoraExtra(): boolean
  {
    return !this.noExisteProcesoExtras(ProcesosAcqua.SECADO);
  }

  private idLavadoraValido(id = 0)
  {
    return id>0 && id<=this.lavadoras.length;
  }

  private idSecadoraValido(id = 0)
  {
    return id>0 && id<=this.secadoras.length;
  }

  private createLavadoraExtra()
  {
    this.isLoading = true;
    this.ticketService.addLavadoraExtra(
      this.ticket.id,
      this.idLavadoraExtra!,
    ).subscribe({
      next: (responseProcXtra: ResponseLavadoraSecadoraExtra) =>
      {
        this.procLavadoraExtra = responseProcXtra;
        this.idProcLavadoraExtra = responseProcXtra.data!.id;
        this.toast.success('Lavadora extra agregada');
        this.fetchTicketById();
      },
      error: (err) =>
      {
        this.toast.error(`Error al agregar la lavadora extra: ${err.message}`);
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private updateLavadora(idProceso = 0, idLavadora = 0, nameLavadora: string)
  {
    this.isLoading = true;
    this.ticketService.updateProceso(
      idProceso ?? 0, idLavadora ?? 0).subscribe({
      next: () =>
      {
        this.toast.success(`${nameLavadora} actualizada`);
        this.fetchTicketById();
      },
      error: (err) =>
      {
        this.toast.error(`Error al actualizar la ${nameLavadora}: ${err.message}`);
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private createSecadoraExtra()
  {
    this.ticketService.addSecadoraExtra(
      this.ticket.id,
      this.idSecadoraExtra!,
    ).subscribe({
      next: (responseProcXtra: ResponseLavadoraSecadoraExtra) =>
      {
        this.procSecadoraExtra = responseProcXtra;
        this.idProcSecadoraExtra = responseProcXtra.data!.id;
        this.toast.success('Secadora extra agregada');
        this.fetchTicketById();
      },
      error: (err) =>
      {
        this.toast.error(`Error al agregar la secadora extra: ${err.message}`);
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private updateSecadora(idProceso = 0, idSecadora = 0, nameSecadora: string)
  {
    this.isLoading = true;
    this.ticketService.updateProceso(
      idProceso, null as unknown as number, idSecadora).subscribe({
      next: () =>
      {
        this.toast.success(`${nameSecadora} actualizada`);
        this.fetchTicketById();
      },
      error: (err) =>
      {
        this.toast.error(`Error al actualizar la ${nameSecadora}: ${err.message}`);
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  setLavadoraSeleccionada()
  {
    this.updateLavadora(this.currentProcesoTicket!.id, this.idLavadora, 'Lavadora');
  }

  setSecadoraSeleccionada()
  {
    this.updateSecadora(this.currentProcesoTicket!.id, this.idSecadora, 'Secadora');
  }

  setLavadoraExtraSeleccionada()
  {
    if(this.idLavadoraValido(this.idLavadoraExtra))
    {
      if(!this.existeProcesoLavadoraExtra())
      {
        this.createLavadoraExtra();
      }
      else
      {
        this.updateLavadora(this.idProcLavadoraExtra, this.idLavadoraExtra, 'Lavadora extra');
      }
    }
    else
    {
      this.toast.error('Error al seleccionar la lavadora extra');
    }
  }

  setSecadoraExtraSeleccionada()
  {
    if(this.idSecadoraValido(this.idSecadoraExtra))
    {
      if(!this.existeProcesoSecadoraExtra())
      {
        this.createSecadoraExtra();
      }
      else
      {
        this.updateSecadora(this.idProcSecadoraExtra, this.idSecadoraExtra, 'Secadora extra');
      }
    }
    else
    {
      this.toast.error('Error al seleccionar la secadora extra');
    }
  }

  private populateChat()
  {
    this.chatHistory = this.ticket.comentarios ?? [];
  }

  private poupulatePrendasTicket()
  {
    this.prendasTicket = this.ticket.prendas_ticket ?? [];
    this.recalcularConteo();
  }

  private confirmAction(message: string)
  {
    return window.confirm(message);
  }

  private handleCurrentProceso()
  {
    switch(this.stepCursor)
    {
    case 0:
      const procesoConteo = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.CONTEO);
      if(!procesoConteo)
      {
        this.toast.error('Error: No encontramos el proceso interno para el conteo');
      }
      else
      {
        // call DB
        this.ticketService.registrarProceso(this.ticket.id, procesoConteo).subscribe(
          {
            next: (response: ResponseRegistrarProceso) =>
            {
              if(this.ticket.procesos_ticket.length === 0)
              {
                if(response !== null && response !== undefined)
                {
                  this.ticket.procesos_ticket.push(response.data!);
                }
              }
              this.setCurrentProcesoTicket();
            },
            error: (err) =>
            {
              console.error(err);
              this.toast.warning('Error al registrar el proceso de conteo');
            },
          },
        );
      }
      break;
    case 2:
      const procesoSecado = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.SECADO);
      if(!procesoSecado)
      {
        this.toast.error('Error: No encontramos el proceso interno para el secado');
      }
      break;
    case 3:
      const procesoReconteo = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.RECONTEO);
      if(!procesoReconteo)
      {
        this.toast.error('Error: No encontramos el proceso interno para el reconteo');
      }
      else
      {
        this.checkReconteo();
      }
      break;
    case 4:
      const procesoEntrega = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.ENTREGA);
      if(!procesoEntrega)
      {
        this.toast.error('Error: No encontramos el proceso interno para la entrega');
      }
      else
      {
        this.cursorEntrega = this.ticket.envio_domicilio == true ? 1 : 0;
        this.idSucursalRecoleccion = this.ticket.id_sucursal ?? 0;
        this.idUbicacionEnvio = this.ticket.id_direccion ?? 0;
      }
      break;
    case 5:
      this.isLoadingStats = true;
      this.fetchTicketStats();
      break;
    }
  }

  private setCurrentProcesoTicket()
  {
    switch (this.stepCursor)
    {
    case 0:
      const procesoInicial = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.CONTEO);
      this.currentProcesoTicket =
        this.ticket.procesos_ticket.find((pt) => pt.id_proceso === procesoInicial?.id) ?? null;
      break;
    case 1:
      const procesos_de_lavado: ProcesoTicket[] = this.getTicketProcessesByName(ProcesosAcqua.LAVADO);
      if(procesos_de_lavado.length > 0)
      {
        this.currentProcesoTicket = procesos_de_lavado[0];
        this.idLavadora = procesos_de_lavado[0].id_lavadora!;
      }
      if(procesos_de_lavado.length > 1)
      {
        this.idProcLavadoraExtra = procesos_de_lavado[1].id;
        this.idLavadoraExtra = procesos_de_lavado[1].id_lavadora;
      }
      break;
    case 2:
      const procesos_de_secado: ProcesoTicket[] = this.getTicketProcessesByName(ProcesosAcqua.SECADO);
      if(procesos_de_secado.length > 0)
      {
        this.currentProcesoTicket = procesos_de_secado[0];
        this.idSecadora = procesos_de_secado[0].id_secadora!;
      }
      if(procesos_de_secado.length > 1)
      {
        this.idProcSecadoraExtra = procesos_de_secado[1].id;
        this.idSecadoraExtra = procesos_de_secado[1].id_secadora;
      }
      break;
    case 3:
      const procesoReconteo = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.RECONTEO);
      this.currentProcesoTicket =
        this.ticket.procesos_ticket.find((pt) => pt.id_proceso === procesoReconteo?.id) ?? null;
      break;
    case 4:
      const procesoEntrega = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.ENTREGA);
      this.currentProcesoTicket =
        this.ticket.procesos_ticket.find((pt) => pt.id_proceso === procesoEntrega?.id) ?? null;
      break;

    default:
      break;
    }
  }

  private populateLavadoras()
  {
    this.ticketService.getLavadoras().subscribe({
      next: (response) =>
      {
        this.lavadoras = response;
      },
      error: (err) =>
      {
        this.toast.error('Error al obtener las lavadoras disponibles');
        console.error(err);
      },
    });
  }

  private populateSecadoras()
  {
    this.ticketService.getSecadoras().subscribe({
      next: (response) =>
      {
        this.secadoras = response;
      },
      error: (err) =>
      {
        this.toast.error('Error al obtener las secadoras disponibles');
        console.error(err);
      },
    });
  }

  shouldDisableFinalizarEntregaButton()
  {
    if(this.ticket.envio_domicilio)
    {
      return this.ticket.id_direccion == null || this.ticket.restante != 0;
    }
    else
    {
      return this.ticket.id_sucursal == null || this.ticket.restante != 0;
    }
  }

  renderPagosModal()
  {
    this.pagosContainer.clear();
    const modalPagosFactory = this.pagosModalFactory.resolveComponentFactory(RegistrarPagoComponent);
    const modalPagoRef = this.pagosContainer.createComponent(modalPagosFactory);
    modalPagoRef.instance.setTicket(this.ticket);
    this.pagosContainerRef = modalPagoRef;
    modalPagoRef.instance.setParentComponent(this.pagosModal);
    this.pagosModal.nativeElement.show();

    this.pagosModal.nativeElement.onclose = () =>
    {
      this.isLoading = true;
      this.fetchTicketById();
    };
  }
  closePagosModal()
  {
    this.pagosModal.nativeElement.close();
  }

  fetchTicketStats()
  {
    this.statsService.getStatsForTicketId(this.ticket.id).subscribe(
      {
        next: (response) =>
        {
          this.isLoadingStats = false;
          this.ticketStats = response;
        },
        error: (err) =>
        {
          console.error(err);
        },
      },
    );
  }

  parseTimeTrackerToTimer(timestamp: string)
  {
    const d = new Date(timestamp);

    let horas: string | number = d.getHours();
    let minutos: string | number = d.getMinutes();
    let segundos: string | number = d.getSeconds();

    horas = horas < 10 ? `0${ horas}` : horas;
    minutos = minutos < 10 ? `0${ minutos}` : minutos;
    segundos = segundos < 10 ? `0${ segundos}` : segundos;

    return `${horas }:${ minutos }:${ segundos}`;
  }

  openReimprimirModal()
  {
    this.reimprimirModal.nativeElement.show();
  }
}
