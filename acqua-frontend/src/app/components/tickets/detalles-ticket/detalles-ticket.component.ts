/* eslint-disable no-unused-vars */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Comentario } from 'src/app/dtos/comentario';
import { Lavadora } from 'src/app/dtos/lavadora';
import { Prenda, PrendaTicket } from 'src/app/dtos/prenda-ticket';
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
  idLavadora = null;
  lavadoras: Lavadora[] = [];

  chatHistory: Comentario[] = [];
  chatForm!: FormGroup;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private auth: AuthService,
    private route: ActivatedRoute,
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

    this.fetchTicketById();
    this.fetchPrendas();
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
          this.isLoading = false;
          this.handleStatus();
          this.populateChat();
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
    const prenda = this.prenda.value;
    const piezas = this.piezas.value;

    const indexFound = this.prendasTicket.findIndex(p => p.nombre === prenda);

    if(indexFound >= 0)
    {
      const previousValue = this.prendasTicket[indexFound].total_inicial ?? 0;
      this.prendasTicket[indexFound].total_inicial =
        parseInt(previousValue.toString()) + parseInt(piezas);
      this.prendasForm.reset();
      this.recalcularConteo();
      return;
    }

    this.prendasTicket.push(
      {
        id_prenda: 1,
        id_ticket: 1,
        nombre: prenda,
        total_inicial: piezas,
      },
    );
    this.prendasForm.reset();
    this.recalcularConteo();
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
      this.stepCursor+= 1;
      break;
    case 1:
    {
      const lavadora = this.lavadoras.find(lav => lav.id == this.idLavadora);
      if(
        this.ask(
          // eslint-disable-next-line max-len
          `Confirmo que he terminado la separación de la ropa y la cargaré en la lavadora: ${lavadora?.nombre}`,
        )
      )
      {
        this.stepCursor+= 1;
      }
      break;
    }
    case 2:
      this.stepCursor+= 1;
      break;
    case 3:
      this.stepCursor+= 1;
      break;
    case 4:
      this.stepCursor+= 1;
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
      this.cursorEntrega = cursor;
    }
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
      this.stepCursor = 1;
      break;
    case StatusTicket.Reconteo:
      this.stepCursor = 2;
      break;
    case StatusTicket.Entrega:
      this.stepCursor = 3;
      break;

    default:
      this.stepCursor = 0;
      break;
    }
  }

  private populateChat()
  {
    this.chatHistory = this.ticket.comentarios ?? [];
  }
}
