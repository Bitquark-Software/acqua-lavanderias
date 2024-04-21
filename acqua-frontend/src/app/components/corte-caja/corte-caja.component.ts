import { Component } from '@angular/core';
import { CorteCajaService } from 'src/app/services/corte-caja.service';
import {
  CorteCajaResponseDelete,
  CorteCajaResponsePost,
  CorteCajaResponsePut,
  CorteCajaResponseGet,
  GananciasResponseGet,
  CorteCaja,
  INPUT_ERRORS,
} from 'src/app/dtos/corte-caja';

@Component({
  selector: 'app-corte-caja',
  templateUrl: './corte-caja.component.html',
  styleUrls: ['./corte-caja.component.scss'],
})

export class CorteCajaComponent
{
  // Variables para binding con input en de los modales
  id_sucursal!: number;
  id_caja!: string;
  monto!: number;
  codigo_admin!: string;
  name_current_process!: string;
  msg_error!: string;
  msg_success!: string;

  // Otros
  current_caja!: CorteCaja | null;

  constructor(private corteCajaService: CorteCajaService)
  {
    this.current_caja = null;
    this.clearTempInputsData();
  }

  clearTempInputsData()
  {
    this.id_sucursal! = 0;
    this.id_caja! = '';
    this.monto! = 0;
    this.codigo_admin! = '';
    this.name_current_process! = '';
    this.msg_error! = '';
    this.msg_success! = '';
  }

  clearTempAllData()
  {
    this.current_caja = null;
    this.clearTempInputsData();
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

  getCashierReconciliation(callback?: (response: CorteCajaResponseGet<CorteCaja>) => void)
  {
    this.corteCajaService.fetchCorteCaja().subscribe({
      next: (response: CorteCajaResponseGet<CorteCaja>) =>
      {
        if(callback)
        {
          callback(response);
        }
      },
      error: (error) =>
      {
        console.error('Error al obtener corte(s) de caja:', error);
      },
    });
  }

  openCashierReconciliation(modal_success = '', modal_error = '')
  {
    this.corteCajaService.createCorteCaja(this.id_sucursal, this.monto, this.codigo_admin!).subscribe({
      next: (response: CorteCajaResponsePost) =>
      {
        this.msg_success = response.mensaje;
        this.showModal(modal_success, () => { this.clearTempAllData(); });
      },
      error: (error) =>
      {
        this.msg_error = error.error.mensaje;
        this.showModal(modal_error, () => {this.clearTempAllData(); });
      },
    });
  }

  requestOpenCashierReconciliation(input_id_sucursal = '', input_monto = '', input_codigo = '', modal_continuar = '', modal_error = '')
  {
    this.name_current_process = 'Apertura de caja'.toUpperCase();

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
          this.msg_error = INPUT_ERRORS.CODIGO_ADMIN;
          this.showModal(modal_error, () => { this.clearTempAllData(); });
        }
      }
      else
      {
        this.msg_error = INPUT_ERRORS.MONTO_APERTURA;
        this.showModal(modal_error, () => { this.clearTempAllData(); });
      }
    }
    else
    {
      this.msg_error = INPUT_ERRORS.ID_SUCURSAL;
      this.showModal(modal_error, () => { this.clearTempAllData(); });
    }
  }

  closeCashierReconciliation(modal_success = '', modal_error = '', codigo_admin?: string)
  {
    const updateCorteCajaSubscription = codigo_admin ?
      this.corteCajaService.forcedUpdateCorteCaja(Number(this.id_caja), this.monto, codigo_admin) :
      this.corteCajaService.updateCorteCaja(Number(this.id_caja), this.monto);

    updateCorteCajaSubscription.subscribe({
      next: (response: CorteCajaResponsePut) =>
      {
        this.name_current_process = 'Cierre de caja'.toUpperCase();
        this.msg_success = response.mensaje;
        this.showModal(modal_success, () => { this.clearTempAllData(); });
      },
      error: (error) =>
      {
        this.name_current_process = 'Cierre de caja'.toUpperCase();
        this.msg_error = error.error.mensaje;
        this.showModal(modal_error, () => {this.clearTempAllData(); });
      },
    });
  }

  requestCloseCashierReconciliation(input_id_caja = '', input_monto = '', modal_continuar = '', modal_error = '', modal_success = '', modal_codigo = '')
  {
    this.name_current_process = 'Cierre de caja'.toUpperCase();

    this.showModal(input_id_caja, () =>
    {
      this.showModal(input_monto, () =>
      {
        this.validateAndCloseCashierReconciliation(modal_continuar, modal_error, modal_success, modal_codigo);
      });
    });
  }

  validateAndCloseCashierReconciliation(modal_continuar_cerrar_caja = '', modal_error = '', modal_success = '', modal_codigo = '')
  {
    const forzar_cierre_de_caja = () =>
    {
      this.name_current_process = 'Forzando el cierre de caja'.toUpperCase();
      this.msg_error = 'El monto de cierre no corresponde con el de apertura';
      this.showModal(modal_error, () =>
      {
        this.showModal(modal_codigo, () =>
        {
          const codigo_admin_valido = /^[\s\t\n]*$/;
          if(!codigo_admin_valido.test(this.codigo_admin))
          {
            this.msg_error = INPUT_ERRORS.CODIGO_ADMIN;
            this.closeCashierReconciliation(modal_success, modal_error, this.codigo_admin);
          }
        });
      });
    };

    const continuar_operaciones = (response: CorteCajaResponseGet<CorteCaja>) =>
    {
      const current_caja: CorteCaja = response.data[0];
      const monto_apertura = Number(current_caja!.monto_apertura);
      const id_caja_valido = !isNaN(Number(this.id_caja)) && Number(this.id_caja) === Number(current_caja.id);
      const monto_cierre_valido = !isNaN(this.monto) && this.monto>0;

      if(current_caja!.abierto === 1)
      {
        if(id_caja_valido)
        {
          if(monto_cierre_valido)
          {
            if(Number(this.monto) >= monto_apertura)
            {
              this.showModal(modal_continuar_cerrar_caja);
            }
            else
            {
              forzar_cierre_de_caja();
            }
          }
          else
          {
            this.msg_error = INPUT_ERRORS.MONTO_CIERRE;
            this.showModal(modal_error, () => { this.clearTempAllData(); });
          }
        }
        else
        {
          this.msg_error = INPUT_ERRORS.ID_CAJA;
          this.showModal(modal_error, () => { this.clearTempAllData(); });
        }
      }
      else
      {
        this.msg_error = 'La caja no se encuentra abierta';
        this.showModal(modal_error, () => { this.clearTempAllData(); });
      }
    };

    this.getCashierReconciliation(continuar_operaciones);
  }

  deleteCashierReconciliation(modal_success = '', modal_error = '')
  {
    this.corteCajaService.deleteCorteCaja(Number(this.id_caja), this.codigo_admin!).subscribe({
      next: (response: void | CorteCajaResponseDelete) =>
      {
        if(!response)
        {
          this.msg_success = 'Eliminado correctamente';
          this.showModal(modal_success, () => { this.clearTempAllData(); });
        }
        else
        {
          this.msg_error = response.mensaje;
          this.showModal(modal_error, () => { this.clearTempAllData(); });
        }
      },
      error: (error) =>
      {
        this.msg_error = error.error.mensaje;
        this.showModal(modal_error, () => {this.clearTempAllData(); });
      },
    });
  }

  requestDeleteCashierReconciliation(input_id_caja = '', input_codigo = '', modal_continuar = '', modal_error = '')
  {
    this.name_current_process = 'Eliminación de caja'.toUpperCase();

    this.showModal(input_id_caja, () =>
    {
      this.showModal(input_codigo, () =>
      {
        this.validateAndDeleteCashierReconciliation(modal_continuar, modal_error);
      });
    });
  }

  validateAndDeleteCashierReconciliation(modal_continuar_eliminar_caja = '', modal_error = '')
  {
    const id_caja_valido = !isNaN(Number(this.id_caja)) && Number(this.id_caja)>0;
    const codigo_admin_valido = /^[\s\t\n]*$/;

    if(id_caja_valido)
    {
      if(!codigo_admin_valido.test(this.codigo_admin))
      {
        this.showModal(modal_continuar_eliminar_caja);
      }
      else
      {
        this.msg_error = INPUT_ERRORS.CODIGO_ADMIN;
        this.showModal(modal_error, () => { this.clearTempAllData(); });
      }
    }
    else
    {
      this.msg_error = INPUT_ERRORS.ID_CAJA;
      this.showModal(modal_error, () => { this.clearTempAllData(); });
    }
  }

  getProfitsFromCashierReconciliation(modal_success = '', modal_error = '')
  {
    this.corteCajaService.getCorteCajaGanancias(this.id_sucursal, Number(this.id_caja)).subscribe({
      next: (response: GananciasResponseGet) =>
      {
        this.msg_success = 'Ganancias obtenidas correctamente!';
        this.showModal(modal_success, () => { this.clearTempAllData(); });
        console.log('* getProfitsFromCashierReconciliation => ', response);
      },
      error: (error) =>
      {
        this.msg_error = error.error.mensaje;
        this.showModal(modal_error, () => {this.clearTempAllData(); });
      },
    });
  }

  requestGetProfitsFromCashierReconciliation(input_id_sucursal = '', input_id_caja = '', modal_continuar = '', modal_error = '')
  {
    this.name_current_process = 'Obtener ganancias de caja'.toUpperCase();

    this.showModal(input_id_sucursal, () =>
    {
      this.showModal(input_id_caja, () =>
      {
        this.validateAndGetProfitsFromCashierReconciliation(modal_continuar, modal_error);
      });
    });
  }

  validateAndGetProfitsFromCashierReconciliation(modal_continuar_obtener_ganacias = '', modal_error = '')
  {
    const id_sucursal = !isNaN(this.id_sucursal) && this.id_sucursal>0;
    const id_caja_valido = !isNaN(Number(this.id_caja)) && Number(this.id_caja)>0;

    if(id_sucursal)
    {
      if(id_caja_valido)
      {
        this.showModal(modal_continuar_obtener_ganacias);
      }
      else
      {
        this.msg_error = INPUT_ERRORS.ID_CAJA;
        this.showModal(modal_error, () => { this.clearTempAllData(); });
      }
    }
    else
    {
      this.msg_error = INPUT_ERRORS.ID_SUCURSAL;
      this.showModal(modal_error, () => { this.clearTempAllData(); });
    }
  }
}
