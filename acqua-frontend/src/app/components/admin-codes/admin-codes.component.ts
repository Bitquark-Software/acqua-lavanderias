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

  constructor(
    private codigoAdminService: AdminCodesService,
  )
  {
    this.current_admin_code = null;
    this.current_page = 1;
  }

  showCurrentAdminCode()
  {
    const messageAlert = () =>
    {
      if(this.current_admin_code !== null && this.current_admin_code!.usado === 0)
      {
        alert(`Tu codigo actual es: ${this.current_admin_code!.codigo}`);
      }
      else
      {
        alert('Usted necesita generar un nuevo código!');
      }
    };
    this.requestGetCurrentAdminCode(messageAlert);
  }

  requestGetCurrentAdminCode(showMessage: () => void)
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

  requestGenerateAdminCode()
  {
    const showMessageSuccess = (response: AdminCodeResponsePostPut) =>
    {
      alert(`El código creado fue: ${response.data.codigo}, recuerda guardarlo bien...`);
    };

    const showMessageDenied = () =>
    {
      alert('Necesita actualizar el estado del ultimo código');
    };

    const continueGenerateCode = () =>
    {
      if(this.current_admin_code === null || this.current_admin_code.usado !== 0)
      {
        const motive: string = this.getMessageFromPrompt();
        this.generateAdminCode(motive, showMessageSuccess);
      }
      else
      {
        showMessageDenied();
      }
    };

    this.requestGetCurrentAdminCode(continueGenerateCode);
  }

  requestUpdateAdminCode()
  {
    const showMessageSuccess = () =>
    {
      alert('Tu código fue utilizado y no puede volver a ser utilizado');
    };

    const showMessageDenied = () =>
    {
      alert('Necesita generar un nuevo código');
    };

    const continueUpdateCode = () =>
    {
      if(this.current_admin_code !== null && this.current_admin_code.usado === 0)
      {
        const id_ticket: number = this.getIdTicketFromPrompt() as number;
        this.updateAdminCode(this.current_admin_code.id!, id_ticket, showMessageSuccess);
      }
      else
      {
        showMessageDenied();
      }
    };
    this.requestGetCurrentAdminCode(continueUpdateCode);
  }

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