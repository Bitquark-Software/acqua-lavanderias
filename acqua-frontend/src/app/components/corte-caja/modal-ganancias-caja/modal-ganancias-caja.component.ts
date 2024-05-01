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
  @Input() showModal = false;
  @Input() current_process!: PROCESOS_CORTE_CAJA | null;
  @Input() ganancias_caja!: GananciasResponseGet;
  @Input() ganancias_caja_anticipos!: AnticiposEnvios;

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
    if (changes['current_process'] || changes['ganancias_caja'] || changes['ganancias_caja_anticipos'])
    {
      // console.log('Cambios en las propiedades de entrada');
    }
  }
}
