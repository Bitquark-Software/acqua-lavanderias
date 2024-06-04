import { Component } from '@angular/core';
import { CorteCajaService } from 'src/app/services/corte-caja.service';
import { CajaStateService } from 'src/app/services/caja-state.service';
import {
  CorteCajaResponseGet,
  GananciasResponseGet,
  CorteCaja,
  PROCESOS_CORTE_CAJA,
  AnticiposEnvios,
} from 'src/app/dtos/corte-caja';
import { AuthDto } from 'src/app/dtos/auth-dto';

@Component({
  selector: 'app-corte-caja-show-all',
  templateUrl: './corte-caja-show-all.component.html',
  styleUrls: ['./corte-caja-show-all.component.scss'],
})

export class CorteCajaShowAllComponent
{
  // Variable de session
  session!: AuthDto | null;

  // Para mensajes de los modales
  name_current_process!: PROCESOS_CORTE_CAJA | null;
  msg_success!: string;
  msg_error!: string;

  // Otros datos necesarios
  id_sucursal!: number;
  id_caja!: number;
  cortes_de_caja!: CorteCaja[];
  cortes_de_caja_structure!: CorteCajaResponseGet<CorteCaja>;
  ganancias_caja!: GananciasResponseGet;
  ganancias_caja_anticipos!: AnticiposEnvios;

  is_requesting!: boolean;

  constructor(
    private corteCajaService: CorteCajaService,
    private cajaStateService: CajaStateService)
  {
    //
  }

  ngOnInit()
  {
    this.fetchLocalSession();
    this.clearTempAllData();
    this.subscribeToUpdateCorteCajaEvent();
  }

  private subscribeToUpdateCorteCajaEvent(): void
  {
    this.cajaStateService.mostrarCajaEvent.subscribe((mostrar: boolean) =>
    {
      this.updateCortesDeCaja();
    });
  }

  updateCortesDeCaja()
  {
    const updateCurrentPageCorteCaja = (response: CorteCajaResponseGet<CorteCaja>) =>
    {
      this.cortes_de_caja = response.data;
      this.cortes_de_caja_structure = response;
    };

    this.getAllCashierClosures(1, updateCurrentPageCorteCaja);
  }

  getAllCashierClosures(page: number, callback?: (response: CorteCajaResponseGet<CorteCaja>) => void)
  {
    this.is_requesting = true;
    this.corteCajaService.fetchCorteCaja(page).subscribe({
      next: (response: CorteCajaResponseGet<CorteCaja>) =>
      {
        if(callback)
        {
          callback(response);
        }
        this.is_requesting = false;
      },
      error: (error) =>
      {
        console.error('Error al obtener corte(s) de caja:', error);
        this.is_requesting = false;
      },
    });
  }

  fetchPreviousPage()
  {
    const updateCurrentPageCorteCaja = (response: CorteCajaResponseGet<CorteCaja>) =>
    {
      this.cortes_de_caja = response.data;
      this.cortes_de_caja_structure = response;
    };

    if(this.cortes_de_caja_structure.prev_page_url)
    {
      const previousPageNumber = parseInt(this.cortes_de_caja_structure.prev_page_url
        .charAt(this.cortes_de_caja_structure.prev_page_url.length - 1));
      this.getAllCashierClosures(previousPageNumber, updateCurrentPageCorteCaja);
    }
  }

  fetchNextPage()
  {
    const updateCurrentPageCorteCaja = (response: CorteCajaResponseGet<CorteCaja>) =>
    {
      this.cortes_de_caja = response.data;
      this.cortes_de_caja_structure = response;
    };

    if(this.cortes_de_caja_structure.next_page_url)
    {
      const nextPageNumber = parseInt(this.cortes_de_caja_structure.next_page_url
        .charAt(this.cortes_de_caja_structure.next_page_url.length - 1));
      this.getAllCashierClosures(nextPageNumber, updateCurrentPageCorteCaja);
    }
  }

  getProfitsFromCashierReconciliation(id_caja = 0, modal_ganancias_caja = '', modal_error = '')
  {
    if(id_caja != 0)
    {
      this.is_requesting = true;
      this.corteCajaService.getCorteCajaGanancias(this.id_sucursal, Number(id_caja)).subscribe({
        next: (response: GananciasResponseGet) =>
        {
          this.name_current_process = PROCESOS_CORTE_CAJA.GANANCIAS;
          this.id_caja = id_caja;
          this.ganancias_caja = response;
          this.ganancias_caja_anticipos = response['anticiposEnvios ']!;
          this.showModal(modal_ganancias_caja);
          this.is_requesting = false;
        },
        error: (error) =>
        {
          this.msg_error = error.error.mensaje;
          this.showModal(modal_error, () => {this.clearTempAllData(); });
          this.is_requesting = false;
        },
      });
    }
    else
    {
      this.msg_error = 'El ID de la caja no es valido';
      this.showModal(modal_error, () => {this.clearTempAllData(); });
    }
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
    this.id_caja = 0;
    this.ganancias_caja = new GananciasResponseGet();
    this.ganancias_caja_anticipos = new AnticiposEnvios();
    this.cortes_de_caja = [];
    this.cortes_de_caja_structure = new CorteCajaResponseGet<CorteCaja>([]);
  }
}
