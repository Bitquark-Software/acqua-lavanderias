/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Categoria } from 'src/app/dtos/catalogo';
import { Servicio } from 'src/app/dtos/servicio';
import { CategoriasService } from 'src/app/services/categorias.service';

@Component({
  selector: 'app-ver-servicios',
  templateUrl: './ver-servicios.component.html',
  styleUrls: ['./ver-servicios.component.scss'],
})
export class VerServiciosComponent
{
  servicios: Servicio[] = [];
  categoria!: Categoria;
  catalogoId!: number;
  servicioEliminar!: Servicio | null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private categoriaService: CategoriasService,
  )
  {
    this.catalogoId = this.route.snapshot.params['categoriaId'];
    this.fetchServicios(1);
  }

  fetchServicios(page: number)
  {
    this.categoriaService.fetchServiciosByCatalogoId(this.catalogoId, page).subscribe({
      next: (response) =>
      {
        this.categoria = response as Categoria;
        this.servicios = this.categoria.servicios as Servicio[];
      },
    });
  }

  back()
  {
    this.location.back();
  }

  showDeletePopup(id:number)
  {
    this.servicioEliminar = this.servicios.find((serv) => serv.id === id) ?? null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if(this.servicioEliminar)
    {
      const popup = document.getElementById('modal_delete_servicio') as HTMLDialogElement;
      popup.showModal();
    }
  }

  closeDeletePopup()
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const popup = document.getElementById('modal_delete_servicio') as HTMLDialogElement;
    popup.close();
  }

  eliminarCategoria(id:number)
  {
    if(this.servicioEliminar)
    {
      this.categoriaService.deleteServicio(id).subscribe({
        next: () =>
        {
          this.fetchServicios(1);
          this.closeDeletePopup();
        },
      });
    }
  }
}
