import { Component, Input, SimpleChanges } from '@angular/core';
import {
  GananciasResponseGet,
  PROCESOS_CORTE_CAJA,
  AnticiposEnvios,
} from 'src/app/dtos/corte-caja';

@Component({
  selector: 'app-modal-ganancias-caja',
  templateUrl: './modal-ganancias-caja.component.html',
  styleUrls: ['./modal-ganancias-caja.component.scss'],
})

export class ModalGananciasCajaComponent
{
  @Input() id_caja!: number;
  @Input() name_current_process!: PROCESOS_CORTE_CAJA | null;
  @Input() ganancias_caja!: GananciasResponseGet;
  @Input() ganancias_caja_anticipos!: AnticiposEnvios;
  @Input() msg_success!: string;
  @Input() msg_error!: string;

  closeModal(name_modal = '')
  {
    const modal = document.getElementById(name_modal);
    if (modal instanceof HTMLDialogElement)
    {
      modal.close();
    }
  }

  ngOnChanges(changes: SimpleChanges)
  {
    if (changes['name_current_process'] || changes['ganancias_caja'] || changes['ganancias_caja_anticipos'])
    {
      // console.log("* name_current_process: ", this.name_current_process);
      // console.log("* ganancias_caja: ", this.ganancias_caja);
      // console.log("* ganancias_caja_anticipos: ", this.ganancias_caja_anticipos);
    }
  }
}
