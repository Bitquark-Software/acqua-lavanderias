/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { Catalogo, Categoria } from 'src/app/dtos/catalogo';
import { CategoriasService } from 'src/app/services/categorias.service';
import { AuthService } from 'src/app/services/auth-service.service';
import { Role } from 'src/app/enums/Role.enum';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
})
export class CatalogoComponent
{
  catalogos: Categoria[] = [];
  categoriaStructure!: Catalogo;
  categoriaEliminar!: Categoria | null;
  Role = Role;
  userRole: Role | undefined = undefined;

  constructor(
    private authService: AuthService,
    private categoriaService: CategoriasService,
  )
  {
    this.fetchCategorias(1);
    this.userRole = this.authService.session?.datos.role;
  }

  fetchCategorias(page?: number)
  {
    this.categoriaService.fetchCatalogos(page).subscribe({
      next: (catalogo) =>
      {
        this.categoriaStructure = catalogo as Catalogo;
        this.catalogos = catalogo.data as Categoria[];
      },
    });
  }

  fetchPreviousPage()
  {
    if(this.categoriaStructure.prev_page_url)
    {
      const previousPageNumber = parseInt(this.categoriaStructure.prev_page_url
        .charAt(this.categoriaStructure.prev_page_url.length - 1));
      this.fetchCategorias(previousPageNumber);
    }
  }

  fetchNextPage()
  {
    if(this.categoriaStructure.next_page_url)
    {
      const nextPageNumber = parseInt(this.categoriaStructure.next_page_url
        .charAt(this.categoriaStructure.next_page_url.length - 1));
      this.fetchCategorias(nextPageNumber);
    }
  }

  showDeletePopup(id:number)
  {
    this.categoriaEliminar = this.catalogos.find((cat) => cat.id === id) ?? null;

    const popup = document.getElementById('modal_delete_categoria') as HTMLDialogElement;
    popup.showModal();
  }

  closeDeletePopup()
  {
    const popup = document.getElementById('modal_delete_categoria') as HTMLDialogElement;
    popup.close();
  }

  eliminarCategoria(id:number)
  {
    if(this.categoriaEliminar)
    {
      this.categoriaService.deleteCatalogo(id).subscribe({
        next: () =>
        {
          this.fetchCategorias(1);
          this.closeDeletePopup();
        },
      });
    }
  }

}
