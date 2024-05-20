import { Component, EventEmitter, Output } from '@angular/core';
import { AuthDto } from 'src/app/dtos/auth-dto';
import {
  CorteCaja,
  CorteCajaResponseGet,
  CorteCajaResponsePost,
  CorteCajaResponsePut,
  INPUT_ERRORS,
  PROCESOS_CORTE_CAJA,
} from 'src/app/dtos/corte-caja';
import { CorteCajaService } from 'src/app/services/corte-caja.service';
import { CajaStateService } from 'src/app/services/caja-state.service';

@Component({
  selector: 'app-corte-caja-open-close',
  templateUrl: './corte-caja-open-close.component.html',
  styleUrls: ['./corte-caja-open-close.component.scss'],
})

export class CorteCajaOpenCloseComponent
{
  // Variable de session
  session!: AuthDto | null;
  caja_abierta!: boolean;

  // Variables para binding con input en de los modales
  id_sucursal!: number;
  id_caja!: string;
  monto!: string;
  codigo_admin!: string;

  // Para modales
  name_current_process!: PROCESOS_CORTE_CAJA | null;
  msg_success!: string;
  msg_error!: string;

  // Otros
  @Output() mostrarCajaEvent = new EventEmitter<boolean>();

  constructor(
    private corteCajaService: CorteCajaService,
    private cajaStateService: CajaStateService,
  )
  {
    this.fetchLocalSession();
    this.clearTempAllData();

    this.cajaStateService.mostrarCajaEvent.subscribe((mostrar: boolean) =>
    {
      this.caja_abierta = mostrar;
    });
  }

  ngOnInit()
  {
    this.setStatusCaja();
  }

  clearTempAllData()
  {
    this.clearTempDataModals();
    this.clearTempDataCorteCaja();
  }

  clearTempDataModals()
  {
    this.name_current_process = null;
    this.msg_error! = '';
    this.msg_success! = '';
  }

  clearTempDataCorteCaja()
  {
    this.id_caja! = '';
    this.monto! = '';
    this.codigo_admin! = '';
  }

  private fetchLocalSession()
  {
    const localSession = localStorage.getItem('session');

    if(localSession)
    {
      this.session = JSON.parse(localSession) as AuthDto;
      this.id_sucursal = this.session.datos.id_sucursal;
    }
    else
    {
      this.session = null;
      this.id_sucursal = -1;
    }
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

  continuarOperacion(modal_success = '', modal_error = '')
  {
    switch(this.name_current_process)
    {
    case PROCESOS_CORTE_CAJA.APERTURA:
      this.name_current_process = PROCESOS_CORTE_CAJA.APERTURA;
      this.openCashierReconciliation(modal_success, modal_error);
      break;
    case PROCESOS_CORTE_CAJA.CIERRE:
      this.name_current_process = PROCESOS_CORTE_CAJA.CIERRE;
      this.closeCashierReconciliation(modal_success, modal_error, this.codigo_admin);
      break;
    default:
      break;
    }
  }

  requestOpenCashierReconciliation(input_monto = '', input_codigo = '', modal_continuar = '', modal_error = '')
  {
    this.name_current_process = PROCESOS_CORTE_CAJA.APERTURA;

    this.showModal(input_monto, () =>
    {
      this.showModal(input_codigo, () =>
      {
        this.validateAndOpenCashierReconciliation(modal_continuar, modal_error);
      });
    });
  }

  validateAndOpenCashierReconciliation(modal_continuar_abrir_caja = '', modal_error = '')
  {
    const id_sucursal_valido = !isNaN(this.id_sucursal) && this.id_sucursal>0;
    const monto_apertura_valido = !isNaN(Number(this.monto)) && Number(this.monto)>0;
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

  requestCloseCashierReconciliation(input_id_caja = '', input_monto = '', modal_codigo = '', modal_continuar = '', modal_error = '')
  {
    this.name_current_process = PROCESOS_CORTE_CAJA.CIERRE;

    this.showModal(input_id_caja, () =>
    {
      this.showModal(input_monto, () =>
      {
        this.showModal(modal_codigo, () =>
        {
          this.validateAndCloseCashierReconciliation(modal_continuar, modal_error);
        });
      });
    });
  }

  validateAndCloseCashierReconciliation(modal_continuar_cerrar_caja = '', modal_error = '')
  {
    const continuar_operaciones = (response: CorteCajaResponseGet<CorteCaja>) =>
    {
      const current_caja: CorteCaja = response.data[0];
      const id_caja_valido = !isNaN(Number(this.id_caja)) && Number(this.id_caja) === Number(current_caja.id);
      const monto_cierre_valido = !isNaN(Number(this.monto)) && Number(this.monto)>0;
      const codigo_admin_formato_valido = this.codigo_admin.trim().length > 0;

      if(current_caja!.abierto === 1)
      {
        if(id_caja_valido)
        {
          if(monto_cierre_valido)
          {
            if(codigo_admin_formato_valido)
            {
              this.showModal(modal_continuar_cerrar_caja);
            }
            else
            {
              this.msg_error = INPUT_ERRORS.CODIGO_ADMIN;
              this.showModal(modal_error, () => { this.clearTempAllData(); });
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
    this.corteCajaService.createCorteCaja(this.id_sucursal, Number(this.monto), this.codigo_admin!).subscribe({
      next: (response: CorteCajaResponsePost) =>
      {
        this.msg_success = response.mensaje;
        this.showModal(modal_success, () => { this.mostrarCaja(); this.clearTempAllData(); });
      },
      error: (error) =>
      {
        this.msg_error = error.error.mensaje;
        this.showModal(modal_error, () => { this.clearTempAllData(); });
      },
    });
  }

  closeCashierReconciliation(modal_success = '', modal_error = '', codigo_admin: string)
  {
    this.corteCajaService.updateCorteCaja(Number(this.id_caja), Number(this.monto), codigo_admin).subscribe({
      next: (response: CorteCajaResponsePut) =>
      {
        this.name_current_process = PROCESOS_CORTE_CAJA.CIERRE;
        this.msg_success = response.mensaje;
        this.showModal(modal_success, () => { this.ocultarCaja(); this.clearTempAllData(); });
      },
      error: (error) =>
      {
        this.name_current_process = PROCESOS_CORTE_CAJA.CIERRE;
        this.msg_error = error.error.mensaje;
        this.showModal(modal_error, () => {this.clearTempAllData(); });
      },
    });
  }

  setStatusCaja()
  {
    const setStatusCaja = (response: CorteCajaResponseGet<CorteCaja>) =>
    {
      if(response.data[0].abierto === 1)
      {
        this.mostrarCaja();
      }
      else
      {
        this.ocultarCaja();
      }
    };

    this.getCashierReconciliation(setStatusCaja);
  }

  mostrarCaja()
  {
    this.cajaStateService.mostrarCajaEvent.emit(true);
  }

  ocultarCaja()
  {
    this.cajaStateService.mostrarCajaEvent.emit(false);
  }

}
