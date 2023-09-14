/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Comentario } from 'src/app/dtos/comentario';
import { Lavadora } from 'src/app/dtos/lavadora';
import { Prenda, PrendaTicket } from 'src/app/dtos/prenda-ticket';
import { Proceso, ProcesoTicket, ProcesosAcqua } from 'src/app/dtos/proceso';
import { Sucursal } from 'src/app/dtos/sucursal';
import { StatusTicket, Ticket } from 'src/app/dtos/ticket';
import { AuthService } from 'src/app/services/auth-service.service';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-detalles-ticket',
  templateUrl: './detalles-ticket.component.html',
  styleUrls: ['./detalles-ticket.component.scss'],
})
export class DetallesTicketComponent
{
  isLoading = true;
  showDisplayError = false;
  ticketId!: number;
  ticket!: Ticket;

  @ViewChild('comentariosModal') comentariosModal!: ElementRef<HTMLDialogElement>;

  stepCursor = 0;
  cursorEntrega = 0;

  prendasTicket: PrendaTicket[] = [];
  prendas: Prenda[] = [];

  prendasForm!: FormGroup;
  piezasText = 'Pieza';
  conteo = 0;
  reconteoOk = false;
  idLavadora!:number;
  lavadoras: Lavadora[] = [];

  chatHistory: Comentario[] = [];
  chatForm!: FormGroup;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  // Proceso's logic
  PROCESOS_EXISTENTES: Proceso[] = [];
  currentProcesoTicket?: ProcesoTicket | null;

  idSucursalRecoleccion = 0;
  idUbicacionEnvio = 0;

  sucursales: Sucursal[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
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
              this.stepCursor+= 1;
              this.fetchTicketById();
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
                p => p.nombre === ProcesosAcqua.RECONTEO) as unknown as Proceso,
            ).subscribe({
              next: () =>
              {
                this.stepCursor+= 1;
                this.fetchTicketById();
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
    case 2:
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
    case 3:
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
    case StatusTicket.Reconteo:
      this.stepCursor = 2;
      break;
    case StatusTicket.Entrega:
      const procesoExistenteEntrega =
        this.PROCESOS_EXISTENTES.find((p) => p.nombre == ProcesosAcqua.ENTREGA);
      const procesoEntregado =
        this.ticket.procesos_ticket.find((p) => p.id_proceso == procesoExistenteEntrega?.id);
      if(procesoEntregado?.timestamp_start && procesoEntregado.timestamp_end)
      {
        this.stepCursor = 4;
      }
      else
      {
        this.stepCursor = 3;
      }
      break;
    }

  }

  setLavadoraSeleccionada()
  {
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
    case 3:
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
      break;
    case 2:
      const procesoReconteo = this.PROCESOS_EXISTENTES.find((p) => p.nombre === ProcesosAcqua.RECONTEO);
      this.currentProcesoTicket =
        this.ticket.procesos_ticket.find((pt) => pt.id_proceso === procesoReconteo?.id) ?? null;
      break;
    case 3:
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

  shouldDisableFinalizarEntregaButton()
  {
    if(this.ticket.envio_domicilio)
    {
      return this.ticket.id_direccion == null;
    }
    else
    {
      return this.ticket.id_sucursal == null;
    }
  }
}
