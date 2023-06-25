/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Categoria } from 'src/app/dtos/catalogo';
import { CategoriasService } from 'src/app/services/categorias.service';

@Component({
  selector: 'app-editar-catalogo',
  templateUrl: './editar-catalogo.component.html',
  styleUrls: ['./editar-catalogo.component.scss'],
})
export class EditarCatalogoComponent
{
  categoria!: Categoria;

  updateCategoriaForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private location: Location,
    private categoriaService: CategoriasService,
  )
  {
    const catalogoId = this.route.snapshot.params['id'];
    this.categoriaService.fetchCatalogoById(catalogoId).subscribe({
      next: (response) =>
      {
        this.categoria = response as Categoria;
        this.updateCategoriaForm = this.fb.group({
          nombre: [this.categoria.name, Validators.required],
        });
      },
    });
  }

  async updateCategoria()
  {
    this.categoriaService.actualizarCatalogoPorId(this.categoria.id, {
      name: this.nombre.value,
    }).subscribe({
      next: () => { this.router.navigate(['/categorias']); },
    });
  }

  back()
  {
    this.location.back();
  }

  get nombre()
  {
    return this.updateCategoriaForm.controls['nombre'];
  }
}
