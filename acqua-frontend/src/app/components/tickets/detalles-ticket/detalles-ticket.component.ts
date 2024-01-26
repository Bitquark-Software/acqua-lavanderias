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
import { Proceso, ProcesoTicket, ProcesosAcqua, ResLavSecXtra } from 'src/app/dtos/proceso';
import { Sucursal } from 'src/app/dtos/sucursal';
import { ReimpimirTicket, StatusTicket, Ticket } from 'src/app/dtos/ticket';
import { AuthService } from 'src/app/services/auth-service.service';
import { TicketService } from 'src/app/services/ticket.service';
import { RegistrarPagoComponent } from '../registrar-pago/registrar-pago.component';
import { Rol } from 'src/app/enums/Rol.enum';
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

  isAdmin = false;
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

    this.isAdmin = this.auth.session?.datos.role == Rol.Administrador;
  }

  fetchSucursales()
  {
    this.ticketService.getSucursales().subscribe({
      next: (sucursales) => this.sucursales = sucursales,
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
        }, 400);
      },
      error: (err) =>
      {
        this.showDisplayError = true;
        console.log(err);
        setTimeout(() =>
        {
          this.isLoading = false;
        }, 400);
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
          this.ticketService.registrarProceso(
            this.ticket.id,
            this.PROCESOS_EXISTENTES.find(p => p.nombre === ProcesosAcqua.LAVADO) as unknown as Proceso,
          ).subscribe({
            next: () =>
            {
              this.ticketService.addLavadoraExtra(
                this.ticket.id,
                this.idLavadoraExtra ?? 3,
              ).subscribe({
                next: (responseProcXtra: ResLavSecXtra) =>
                {
                  console.log('Respuesta del proceso de la lavadora extra: ');
                  console.log(responseProcXtra);
                  this.idProcLavadoraExtra = responseProcXtra.data!.id;
                  this.stepCursor+= 1;
                  this.fetchTicketById();
                },
                error: (err) =>
                {
                  this.toast.error(`Error en del proceso la lavadora extra: ${err.message}`);
                  console.error(err);
                  this.isLoading = false;
                },
              });
            },
            error: (err) =>
            {
              this.toast.error(`Error: ${err.message}`);
              console.error(err);
            },
          });
        },
        error: () => this.isLoading = false,
      });
      break;
    // Lavado
    case 1:
    {
      const lavadora = this.lavadoras.find(lav => lav.id == this.idLavadora);
      if(lavadora)
      {
        this.isLoading = true;
        this.ticketService.updateProceso(this.currentProcesoTicket?.id ?? 0).subscribe({
          next: () =>
          {
            this.ticketService.registrarProceso(
              this.ticket.id,
              this.PROCESOS_EXISTENTES.find(
                p => p.nombre === ProcesosAcqua.SECADO) as unknown as Proceso,
            ).subscribe({
              next: () =>
              {
                this.ticketService.addSecadoraExtra(
                  this.ticket.id,
                  this.idSecadoraExtra ?? 3,
                ).subscribe({
                  next: (responseProcXtra: ResLavSecXtra) =>
                  {
                    console.log('Respuesta del proceso de la secadora extra: ');
                    console.log(responseProcXtra);
                    this.idProcSecadoraExtra = responseProcXtra.data!.id;
                    this.stepCursor+= 1;
                    this.fetchTicketById();
                  },
                  error: (err) =>
                  {
                    this.toast.error(`Error al agregar la secadora extra: ${err.message}`);
                    console.error(err);
                    this.isLoading = false;
                  },
                });
              },
              error: (err) =>
              {
                this.toast.error(`Error: ${err.message}`);
                console.error(err);
                this.isLoading = false;
              },
            });
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
      this.isLoading = true;
      this.ticketService.updateProceso(this.currentProcesoTicket?.id ?? 0).subscribe({
        next: () =>
        {
          this.ticketService.registrarProceso(
            this.ticket.id,
            this.PROCESOS_EXISTENTES.find(
              p => p.nombre === ProcesosAcqua.RECONTEO) as unknown as Proceso,
          ).subscribe({
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
        },
        error: (err) =>
        {
          this.isLoading = false;
          console.error(err);
        },
      });
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
              this.ticketService.registrarProceso(
                this.ticket.id,
                this.PROCESOS_EXISTENTES.find(
                  p => p.nombre === ProcesosAcqua.ENTREGA) as unknown as Proceso,
              ).subscribe({
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
        this.toast.warning('El cliente no tiene direcciones guardadas');
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

  setLavadoraExtraSeleccionada()
  {
    if(this.idLavadora === this.idLavadoraExtra)
    {
      this.idLavadoraExtra = 0;
    }
    else
    {
      this.isLoading = true;
      this.ticketService.updateProceso(
        this.idProcLavadoraExtra ?? 0, this.idLavadoraExtra ?? 0).subscribe({
        next: () =>
        {
          this.toast.success('Lavadora extra asignada');
          this.fetchTicketById();
        },
        error: (err) =>
        {
          this.toast.error(`Error al actualizar la lavadora extra: ${err.message}`);
          console.error(err);
          this.isLoading = false;
        },
      });
    }
  }

  setLavadoraSeleccionada()
  {
    if(this.idLavadora === this.idLavadoraExtra)
    {
      this.idLavadoraExtra = 0;
    }
    this.isLoading = true;
    this.ticketService.updateProceso(
      this.currentProcesoTicket?.id ?? 0, this.idLavadora ?? 0).subscribe({
      next: () =>
      {
        this.toast.success('Lavadora asignada');
        this.fetchTicketById();
      },
    });
  }

  setSecadoraExtraSeleccionada()
  {
    if(this.idSecadora === this.idSecadoraExtra)
    {
      this.idSecadoraExtra = 0;
    }
    else
    {
      this.isLoading = true;
      this.ticketService.updateProceso(
        this.idProcSecadoraExtra ?? 0, null as unknown as number, this.idSecadoraExtra ?? 0).subscribe({
        next: () =>
        {
          this.toast.success('Secadora extra asignada');
          this.fetchTicketById();
        },
        error: (err) =>
        {
          this.toast.error(`Error al actualizar la secadora extra: ${err.message}`);
          console.error(err);
          this.isLoading = false;
        },
      });
    }
  }

  setSecadoraSeleccionada()
  {
    if(this.idSecadora === this.idSecadoraExtra)
    {
      this.idSecadoraExtra = 0;
    }
    this.isLoading = true;
    this.ticketService.updateProceso(
      this.currentProcesoTicket?.id ?? 0, null as unknown as number, this.idSecadora ?? 0).subscribe({
      next: () =>
      {
        this.toast.success('Secadora asignada');
        this.fetchTicketById();
      },
    });
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
      const proceso = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.CONTEO);
      if(!proceso)
      {
        this.toast.error('Error: No encontramos el proceso interno para el conteo');
      }
      else
      {
        // call DB
        this.ticketService.registrarProceso(this.ticket.id, proceso).subscribe(
          {
            next: (response) => console.log,
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
      const procesoLavado = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.LAVADO);
      this.currentProcesoTicket =
        this.ticket.procesos_ticket.find((pt) => pt.id_proceso === procesoLavado?.id) ?? null;
      this.idLavadora = this.currentProcesoTicket?.id_lavadora ?? null as unknown as number;
      const procesos_de_lavado: ProcesoTicket[] = this.getTicketProcessesById(3);
      this.idProcLavadoraExtra = procesos_de_lavado[1].id;
      this.idLavadoraExtra = procesos_de_lavado[1].id_lavadora;
      break;
    case 2:
      const procesoSecado = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.SECADO);
      this.currentProcesoTicket =
        this.ticket.procesos_ticket.find((pt) => pt.id_proceso === procesoSecado?.id) ?? null;
      this.idSecadora = this.currentProcesoTicket?.id_secadora ?? null as unknown as number;
      const procesos_de_secado: ProcesoTicket[] = this.getTicketProcessesById(4);
      this.idProcSecadoraExtra = procesos_de_secado[1].id;
      this.idSecadoraExtra = procesos_de_secado[1].id_secadora;
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

  private getTicketProcessesById(id: number): ProcesoTicket[]
  {
    const process_by_id: ProcesoTicket[] = [];
    this.ticket.procesos_ticket.forEach(process =>
    {
      if(process.id_proceso === id)
      {
        process_by_id.push(process);
      }
    });
    return process_by_id;
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
