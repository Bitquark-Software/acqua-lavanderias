/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { Categoria } from 'src/app/dtos/catalogo';
import { Servicio } from 'src/app/dtos/servicio';
import { CategoriasService } from 'src/app/services/categorias.service';

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.scss'],
})
export class CajaComponent
{
  isModalOpened = false;
  isSelectingCategorias = true;
  isSelectingServicios = false;

  categorias: Categoria[] = [];
  servicios: Servicio[] = [];

  constructor(
    private categoriasService: CategoriasService,
  )
  {
    this.categoriasService.fetchCatalogos().subscribe(
      {
        next: (response) => this.categorias = response.data as Categoria[],
      },
    );
  }

  inputServicioChange(e: Event)
  {
    const input = e.target as HTMLInputElement;

    if(input.value != null)
    {
      input.value = '';
    }
  }

  blurServiceInput(e: Event)
  {
    const input = e.target as HTMLInputElement;
    input.blur();
  }

  renderServiciosModal()
  {
    if(!this.isModalOpened)
    {
      const dialog = document.getElementById('modal_categorias_servicios') as HTMLDialogElement;

      if(dialog)
      {
        dialog.showModal();
      }
    }
  }

  renderServiciosPorCategoria(e: Event, idCategoria:number)
  {
    e.preventDefault();

    this.isSelectingCategorias = false;
    this.isSelectingServicios = true;

    this.categoriasService.fetchServiciosByCatalogoId(idCategoria).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (response: any) =>
      {
        console.log(response);
        this.servicios = response.servicios as Servicio[];
      },
    });
  }

  resetDialog()
  {
    const dialog = document.getElementById('modal_categorias_servicios') as HTMLDialogElement;

    if(dialog)
    {
      dialog.close();
    }
    this.isSelectingServicios = false;
    this.servicios = [];
    this.isSelectingCategorias = true;
  }
}
