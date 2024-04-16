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
  constructor(private corteCajaService: CorteCajaService)
  {
    //
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

  abrirCorteCaja()
  {
    this.corteCajaService.createCorteCaja(1, 1000, 'UNAO6782').subscribe({
      next: (response: CorteCajaResponsePost) =>
      {
        console.log('Respuesta (AperturaCajaResponsePost):', response.data);
      },
      error: (error) =>
      {
        console.error('Error al crear corte de caja:', error);
      },
    });
  }

  cerrarCorteCaja()
  {
    this.corteCajaService.updateCorteCaja(11, 1000).subscribe({
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
    this.corteCajaService.deleteCorteCaja(12, 'ZSTX2533').subscribe({
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
    this.corteCajaService.getCorteCajaGanancias(1, 11).subscribe({
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
