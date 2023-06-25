/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { CategoriasService } from 'src/app/services/categorias.service';

@Component({
  selector: 'app-nuevo-catalogo',
  templateUrl: './nuevo-catalogo.component.html',
  styleUrls: ['./nuevo-catalogo.component.scss'],
})
export class NuevoCatalogoComponent
{
  nuevaCategoriaForm = this.fb.group({
    nombre: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private location: Location,
    private categoriaService: CategoriasService,
  )
  {
    //
  }

  get nombre()
  {
    return this.nuevaCategoriaForm.controls['nombre'];
  }

  back()
  {
    this.location.back();
  }

  async registrarCategoria()
  {
    const nombre:string = this.nombre.value ?? '';
    if(nombre.length == 0)
    {
      this.toast.error('Formulario incompleto');
    }

    if(nombre)
    {
      this.categoriaService.crearCategoria(nombre)
        .subscribe({
          next: () =>
          {
            this.location.back();
          },
        });
    }
  }
}
