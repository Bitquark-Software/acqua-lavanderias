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
    const id_sucursal = Number(prompt('Ingrese el ID de la sucursal:'));
    const monto_apertura = Number(prompt('Ingrese el monto de apertura:'));
    const codigoadmin = prompt('Ingrese el código del admin:');

    this.corteCajaService.createCorteCaja(id_sucursal, monto_apertura, codigoadmin!).subscribe({
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
    const id_sucursal = Number(prompt('Ingrese el ID de la sucursal:'));
    const monto_cierre = Number(prompt('Ingrese el monto de cierre:'));

    this.corteCajaService.updateCorteCaja(id_sucursal, monto_cierre).subscribe({
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
    const codigo_admin = prompt('Ingrese el código admin:');

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
    const id_caja = Number(prompt('Ingrese id de la caja:'));

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
