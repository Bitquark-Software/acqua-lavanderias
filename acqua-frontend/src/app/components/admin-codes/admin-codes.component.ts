import { Component } from '@angular/core';
import { AdminCode, AdminCodeResponseGet, AdminCodeResponsePostPut } from 'src/app/dtos/admin-code';
import { AdminCodesService } from 'src/app/services/admin-codes.service';

type CallbackResponseGet = (response: AdminCodeResponseGet) => void;
type CallbackResponsePostPut = (response: AdminCodeResponsePostPut) => void;

@Component({
  selector: 'app-admin-codes',
  templateUrl: './admin-codes.component.html',
  styleUrls: ['./admin-codes.component.scss'],
})

export class AdminCodesComponent
{
  current_page: number;
  current_admin_code: AdminCode | null;
  temp_id_ticket: number | null;
  temp_motivo_codigo: string | null;

  constructor(
    private codigoAdminService: AdminCodesService,
  )
  {
    this.current_admin_code = null;
    this.current_page = 1;
    this.temp_id_ticket = 0;
    this.temp_motivo_codigo = '';
    // Esta instrucción es necesaria para que cargen correctamente los modales con valor
    this.getCurrentAdminCode(() => {});
  }

  showModal(name_modal = '')
  {
    const modal = document.getElementById(name_modal);
    if (modal instanceof HTMLDialogElement)
    {
      modal.showModal();
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

  requestCurrentAdminCode(modal_success = '', modal_fail = '')
  {
    const modalMessages = () =>
    {
      if(this.current_admin_code !== null && this.current_admin_code!.usado === 0)
      {
        this.showModal(modal_success);
      }
      else
      {
        this.showModal(modal_fail);
      }
    };
    this.getCurrentAdminCode(modalMessages);
  }

  getCurrentAdminCode(showMessage: () => void)
  {
    const gotoLastPageCallback = (response: AdminCodeResponseGet) =>
    {
      if(this.current_page !== response.last_page)
      {
        this.current_page = response.last_page!;
        this.getAdminCodes(response.last_page!, showMessage);
      }
      else
      {
        showMessage();
      }
    };
    this.getAdminCodes(this.current_page, gotoLastPageCallback);
  }

  requestGenerateAdminCode(modal_input_motivo = '', modal_fail = '')
  {
    const continueGenerateCode = () =>
    {
      if(this.current_admin_code === null || this.current_admin_code.usado !== 0)
      {
        this.showModal(modal_input_motivo);
      }
      else
      {
        this.showModal(modal_fail);
      }
    };

    this.getCurrentAdminCode(continueGenerateCode);
  }

  requestUpdateAdminCode(modal_input_id_ticket = '', modal_fail = '')
  {
    const continueUpdateCode = () =>
    {
      if(this.current_admin_code !== null && this.current_admin_code.usado === 0)
      {
        this.showModal(modal_input_id_ticket);
      }
      else
      {
        this.showModal(modal_fail);
      }
    };
    this.getCurrentAdminCode(continueUpdateCode);
  }

  /*
  getIdTicketFromPrompt(): number
  {
    let id_ticket: string | null = null;

    while (id_ticket === null)
    {
      id_ticket = prompt('Ingrese el id del ticket: ');
      console.log('* Id: ', id_ticket);
    }

    return Number(id_ticket);
  }

  getMessageFromPrompt(): string
  {
    let message: string | null = null;

    while (message === null)
    {
      message = prompt('Ingrese el motivo del código: ');
      console.log('* Motivo: ', message);
    }

    return message;
  }
  */

  updateAdminCodeModal(modal_success = '', modal_fail = '')
  {
    const showMessageSuccess = () =>
    {
      this.showModal(modal_success);
    };

    if(this.temp_id_ticket !== null && this.temp_id_ticket > 0)
    {
      this.updateAdminCode(this.current_admin_code!.id!, this.temp_id_ticket, showMessageSuccess);
    }
    else
    {
      this.showModal(modal_fail);
    }
  }

  generateAdminCodeModal(modal_success = '', modal_fail = '')
  {
    const showMessageSuccess = () =>
    {
      this.showModal(modal_success);
    };

    if(this.temp_motivo_codigo !== null && this.temp_motivo_codigo !== '')
    {
      this.generateAdminCode(this.temp_motivo_codigo, showMessageSuccess);
    }
    else
    {
      this.showModal(modal_fail);
    }
  }

  getAdminCodes(page: number, callback: CallbackResponseGet)
  {
    this.codigoAdminService.fetchAdminCodes(page).subscribe({
      next: (response: AdminCodeResponseGet) =>
      {
        this.current_admin_code = response.data[response.data.length-1];
        callback(response);
      },
      error: (err) =>
      {
        console.error(`Error: ${err.message ?? ' - No fue posible obtener los codigos'}`);
      },
    });
  }

  generateAdminCode(message: string, callback: CallbackResponsePostPut)
  {
    this.codigoAdminService.createAdminCode(message).subscribe({
      next: (response: AdminCodeResponsePostPut) =>
      {
        this.current_admin_code = response.data;
        callback(response);
      },
      error: (err) =>
      {
        console.error(`Error: ${err.message ?? ' - No fue posible crear el código'}`);
      },
    });
  }

  updateAdminCode(id_code: number, id_ticket: number, callback: CallbackResponsePostPut)
  {
    this.codigoAdminService.updateAdminCodeById(id_code, id_ticket).subscribe({
      next: (response: AdminCodeResponsePostPut) =>
      {
        this.current_admin_code = response.data;
        callback(response);
      },
      error: (err) =>
      {
        console.error(`Error: ${err.message ?? ' - No fue posible actualizar el estado del código'}`);
      },
    });
  }
}