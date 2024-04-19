import { Component } from '@angular/core';
import { CorteCajaService } from 'src/app/services/corte-caja.service';
import {
  CorteCajaResponseDelete,
  CorteCajaResponsePost,
  CorteCajaResponsePut,
  CorteCajaResponseGet,
  GananciasResponseGet,
  CorteCaja,
} from 'src/app/dtos/corte-caja';

@Component({
  selector: 'app-corte-caja',
  templateUrl: './corte-caja.component.html',
  styleUrls: ['./corte-caja.component.scss'],
})

export class CorteCajaComponent
{
  id_sucursal!: number;
  id_caja!: number;
  monto!: number;
  codigo_admin!: string;
  name_current_process!: string;
  msg_error!: string;
  msg_success!: string;

  constructor(private corteCajaService: CorteCajaService)
  {
    this.clearDataTemp();
  }

  clearDataTemp()
  {
    this.id_sucursal! = 0;
    this.id_caja! = 0;
    this.monto! = 0;
    this.codigo_admin! = '';
    this.name_current_process! = '';
    this.msg_error! = '';
    this.msg_success! = '';
  }

  isInputEmpty(id_input = ''): boolean
  {
    const idInput = document.getElementById(id_input) as HTMLInputElement;
    return idInput.value.trim() === '';
  }

  showModal(name_modal = '', callback?: () => void): void
  {
    const modal = document.getElementById(name_modal);
    if (modal instanceof HTMLDialogElement)
    {
      modal.showModal();
      if (callback)
      {
        modal.addEventListener('close', callback, { once: true });
      }
    }
  }

  closeModal(name_modal = '')
  {
    const modal = document.getElementById(name_modal);
    if (modal instanceof HTMLDialogElement)
    {
      modal.close();
    }
  }

  getAllCorteCaja()
  {
    this.corteCajaService.getAllCorteCaja().subscribe({
      next: (response: CorteCajaResponseGet<CorteCaja>) =>
      {
        console.log('Respuesta (CorteCajaResponseGet):', response);
      },
      error: (error) =>
      {
        console.error('Error al obtener corte(s) de caja:', error);
      },
    });
  }

  openCashierReconciliation(modal_error = '')
  {
    this.corteCajaService.createCorteCaja(this.id_sucursal, this.monto, this.codigo_admin!).subscribe({
      next: (response: CorteCajaResponsePost) =>
      {
        this.msg_success = response.mensaje;
        this.showModal('modal_show_success', () => { this.clearDataTemp(); });
        // console.log('Respuesta (AperturaCajaResponsePost):', response.data);
      },
      error: (error) =>
      {
        this.msg_error = error.error.mensaje;
        this.showModal(modal_error, () => {this.clearDataTemp(); });
      },
    });
  }

  requestOpenCashierReconciliation(input_id_sucursal = '', input_monto = '', input_codigo = '', modal_continuar = '', modal_error = '')
  {
    this.name_current_process = 'Apertura corte de caja'.toUpperCase();

    this.showModal(input_id_sucursal, () =>
    {
      this.showModal(input_monto, () =>
      {
        this.showModal(input_codigo, () =>
        {
          this.validateAndOpenCashierReconciliation(modal_continuar, modal_error);
        });
      });
    });
  }

  validateAndOpenCashierReconciliation(modal_continuar_abrir_caja = '', modal_error = '')
  {
    const id_sucursal_valido = !isNaN(this.id_sucursal) && this.id_sucursal>0;
    const monto_apertura_valido = !isNaN(this.monto) && this.monto>0;
    const codigo_admin_valido = /^[\s\t\n]*$/;

    if(id_sucursal_valido)
    {
      if(monto_apertura_valido)
      {
        if(!codigo_admin_valido.test(this.codigo_admin))
        {
          this.showModal(modal_continuar_abrir_caja);
        }
        else
        {
          this.msg_error = 'Necesita ingresar un código valido';
          this.showModal(modal_error, () => { this.clearDataTemp(); });
        }
      }
      else
      {
        this.msg_error = 'El monto de apertura no es valido';
        this.showModal(modal_error, () => { this.clearDataTemp(); });
      }
    }
    else
    {
      this.msg_error = 'El ID de sucursal no es valido';
      this.showModal(modal_error, () => { this.clearDataTemp(); });
    }
  }

  cerrarCorteCaja()
  {
    const id_caja = Number(prompt('Ingrese el ID de la caja:'));
    const monto_cierre = Number(prompt('Ingrese el monto de cierre:'));

    this.corteCajaService.updateCorteCaja(id_caja, monto_cierre).subscribe({
      next: (response: CorteCajaResponsePut) =>
      {
        console.log('Respuesta (AperturaCajaResponsePut):', response);
      },
      error: (error) =>
      {
        console.error('Error al actualizar corte de caja:', error);
      },
    });
  }

  eliminarCorteCaja()
  {
    const id_caja = Number(prompt('Ingrese el ID de la caja:'));
    const codigo_admin = prompt('Ingrese el código administrador:');

    this.corteCajaService.deleteCorteCaja(id_caja, codigo_admin!).subscribe({
      next: (response: void | CorteCajaResponseDelete) =>
      {
        console.log('Respuesta (eliminar corte de caja):', response);
      },
      error: (error) =>
      {
        console.error('Error al eliminar corte de caja:', error);
      },
    });
  }

  getCorteCajaGanancias()
  {
    const id_sucursal = Number(prompt('Ingrese el ID de la sucursal:'));
    const id_caja = Number(prompt('Ingrese ID de la caja:'));

    this.corteCajaService.getCorteCajaGanancias(id_sucursal, id_caja).subscribe({
      next: (response: GananciasResponseGet) =>
      {
        console.log('Respuesta (GananciasResponseGet):', response);
      },
      error: (error) =>
      {
        console.error('Error al obtener ganancias:', error);
      },
    });
  }
}
