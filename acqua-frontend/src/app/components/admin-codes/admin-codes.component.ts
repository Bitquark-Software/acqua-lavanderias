import { Component } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { AdminCodesService } from 'src/app/services/admin-codes.service';
import {
  AdminCode,
  AdminCodeResponseGet,
  AdminCodeResponsePostPut,
} from 'src/app/dtos/admin-code';

type CallbackResponseGet = (response: AdminCodeResponseGet) => void;
type CallbackResponsePostPut = (response: AdminCodeResponsePostPut) => void;

@Component({
  selector: 'app-admin-codes',
  templateUrl: './admin-codes.component.html',
  styleUrls: ['./admin-codes.component.scss'],
})

export class AdminCodesComponent
{
  current_page!: number;
  current_code!: AdminCode | null;

  ticket_id_input!: string | null;
  code_reason_input!: string | null;

  current_process_name!: string;
  aborted_process!: boolean;
  is_requesting!: boolean;
  copied_clipboard!: boolean;

  msg_success_modal!: string;
  msg_error_modal!: string;

  static show_code_modal: string;
  static success_modal: string;
  static error_modal: string;
  static code_reason_modal: string;
  static ticket_id_modal: string;

  constructor(
    private codigoAdminService: AdminCodesService,
    private toast: HotToastService,
  )
  {
    AdminCodesComponent.show_code_modal = 'show_code_modal_id';
    AdminCodesComponent.success_modal = 'success_modal_id';
    AdminCodesComponent.error_modal = 'error_modal_id';
    AdminCodesComponent.code_reason_modal = 'code_reason_modal_id';
    AdminCodesComponent.ticket_id_modal = 'ticket_id_modal_id';
  }

  ngOnInit()
  {
    this.inicializarVariables();
  }

  inicializarVariables()
  {
    this.current_code = null;
    this.current_page = 1;
    this.ticket_id_input = '0';
    this.code_reason_input = '';
    this.msg_success_modal = '';
    this.msg_error_modal = '';
    this.current_process_name = '';
    this.aborted_process = false;
    this.is_requesting = false;
    this.copied_clipboard = false;
  }

  copyCodeToClipboard()
  {
    if(this.current_code !== null && !this.current_code.usado)
    {
      navigator.clipboard.writeText(this.current_code.codigo!).then(() =>
      {
        this.copied_clipboard = true;
        this.toast.info('Se ha copiado al protapapeles');
      }).catch((error) =>
      {
        this.toast.error('No fue posible copiar al portapales');
        console.error('Clipboard error:', error);
      });
    }
    else
    {
      this.toast.warning('No hay código disponible para copiar');
    }
  }

  clearClipboard()
  {
    navigator.clipboard.writeText('').then(() =>
    {
      this.copied_clipboard = false;
      this.toast.info('Se ha limpiado el portapapeles');
    }).catch((error) =>
    {
      this.toast.error('No fue posible copiar al portapales');
      console.error('Clipboard error:', error);
    });
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

  closeModal(name_modal = '', callback?: () => void)
  {
    const modal = document.getElementById(name_modal);
    if (modal instanceof HTMLDialogElement)
    {
      modal.close();
      if (callback)
      {
        modal.addEventListener('close', callback, { once: true });
      }
    }
  }

  isInputEmpty(id_input = ''): boolean
  {
    // Valida saltos de linea, tabulaciones y espacios en blanco
    const regex_input = /^[\s\t\n]+$/;
    const idInput = document.getElementById(id_input) as HTMLInputElement;
    return regex_input.test(idInput.value) || idInput.value.length === 0;
  }

  abort_process(modal_close = '')
  {
    this.aborted_process = true;
    this.closeModal(modal_close, () =>
    {
      this.inicializarVariables();
    });
  }

  requestCurrentAdminCode()
  {
    this.current_process_name = 'Consulta del código actual'.toUpperCase();
    this.getCurrentAdminCode(() =>
    {
      this.showModal(AdminCodesComponent.show_code_modal, () =>
      {
        this.inicializarVariables();
      });
    });
  }

  requestGenerateAdminCode()
  {
    this.current_process_name = 'Creación de nuevo código'.toUpperCase();

    const continueGenerateCode = () =>
    {
      if(this.current_code === null || this.current_code !== null && this.current_code.usado)
      {
        this.generateAdminCode(this.code_reason_input!, (response: AdminCodeResponsePostPut) =>
        {
          this.msg_success_modal = `Su nuevo código es ahora: ${response.data.codigo}`;
          this.current_code = response.data;
          this.showModal(AdminCodesComponent.show_code_modal, () =>
          {
            this.inicializarVariables();
          });
        });
      }
      else
      {
        this.msg_error_modal = 'Ya se dispone de un código, no es necesario generar otro';
        this.showModal(AdminCodesComponent.error_modal, () =>
        {
          this.inicializarVariables();
        });
      }
    };

    this.showModal(AdminCodesComponent.code_reason_modal, () =>
    {
      if(this.aborted_process === false)
      {
        this.getCurrentAdminCode(() =>
        {
          continueGenerateCode();
        });
      }
    });

  }

  requestUpdateAdminCode()
  {
    this.current_process_name = 'Actualización del estado del código'.toUpperCase();

    const continueUpdateCode = () =>
    {
      if(this.current_code !== null && !this.current_code.usado)
      {
        this.updateAdminCode(Number(this.current_code.id), Number(this.ticket_id_input), (response: AdminCodeResponsePostPut) =>
        {
          this.msg_success_modal = `Su código ${response.data.codigo} se ha actualizado  y no se puede volver a usar`;
          this.showModal(AdminCodesComponent.success_modal, () =>
          {
            this.inicializarVariables();
          });
        });
      }
      else
      {
        this.msg_error_modal = 'No hay código disponible para actualizar';
        this.showModal(AdminCodesComponent.error_modal, () =>
        {
          this.inicializarVariables();
        });
      }
    };

    this.showModal(AdminCodesComponent.ticket_id_modal, () =>
    {
      if(this.aborted_process === false)
      {
        if(!isNaN(Number(this.ticket_id_input)) && Number(this.ticket_id_input)>0)
        {
          this.getCurrentAdminCode(() =>
          {
            continueUpdateCode();
          });
        }
        else
        {
          this.msg_error_modal = 'El id del ticket no es valido';
          this.showModal(AdminCodesComponent.error_modal, () =>
          {
            this.inicializarVariables();
          });
        }
      }
    });
  }

  getCurrentAdminCode(callBack: (response: AdminCodeResponseGet) => void)
  {
    const setMessageLastCode = (response: AdminCodeResponseGet) =>
    {
      if(response.data.length > 0)
      {
        if(!response.data[response.data.length-1].usado)
        {
          this.msg_success_modal = `El código actualmente disponible es: ${this.current_code!.codigo}`;
        }
        else
        {
          this.msg_success_modal = 'No hay códigos disponibles, debe generar uno nuevo';
        }
      }
      else
      {
        this.msg_success_modal = 'No hay códigos disponibles, debe generar uno nuevo';
      }
    };

    this.getAdminCodes(this.current_page, (first_response: AdminCodeResponseGet) =>
    {
      this.current_page = first_response.last_page!;
      this.getAdminCodes(first_response.last_page!, (second_response: AdminCodeResponseGet) =>
      {
        if(first_response.data.length > 0)
        {
          this.current_code = second_response.data[second_response.data.length-1];
        }
        else
        {
          this.current_code = null;
        }
        setMessageLastCode(second_response);
        callBack(second_response);
      });
    });
  }

  getAdminCodes(page: number, callback: CallbackResponseGet)
  {
    this.is_requesting = true;
    this.codigoAdminService.fetchAdminCodes(page).subscribe({
      next: (response: AdminCodeResponseGet) =>
      {
        callback(response);
      },
      error: (err) =>
      {
        this.msg_error_modal = 'No fue posible obtener los codigos';
        this.showModal(AdminCodesComponent.error_modal);
        console.error('Error al obtener los código: ', err.message);
      },
    });
  }

  generateAdminCode(message: string, callback: CallbackResponsePostPut)
  {
    this.is_requesting = true;
    this.codigoAdminService.createAdminCode(message).subscribe({
      next: (response: AdminCodeResponsePostPut) =>
      {
        callback(response);
      },
      error: (err) =>
      {
        this.msg_error_modal = 'No fue posible crear el código';
        this.showModal(AdminCodesComponent.error_modal);
        console.error('Error al generar el código: ', err.message);
      },
    });
  }

  updateAdminCode(id_code: number, id_ticket: number, callback: CallbackResponsePostPut)
  {
    this.is_requesting = true;
    this.codigoAdminService.updateAdminCodeById(id_code, id_ticket).subscribe({
      next: (response: AdminCodeResponsePostPut) =>
      {
        callback(response);
      },
      error: (err) =>
      {
        this.msg_error_modal = ' No fue posible actualizar el estado del código';
        this.showModal(AdminCodesComponent.error_modal);
        console.error('Error al actualizar el código: ', err.message);
      },
    });
  }
}