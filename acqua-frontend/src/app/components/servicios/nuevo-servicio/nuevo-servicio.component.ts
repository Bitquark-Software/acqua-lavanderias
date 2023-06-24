/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { CategoriasService } from 'src/app/services/categorias.service';

@Component({
  selector: 'app-nuevo-servicio',
  templateUrl: './nuevo-servicio.component.html',
  styleUrls: ['./nuevo-servicio.component.scss'],
})
export class NuevoServicioComponent
{
  catalogoId: number;
  nuevoServicioForm = this.fb.group({
    cantidadMinima: ['', [Validators.required, Validators.min(1)]],
    importe: ['', [Validators.required, Validators.min(1)]],
    nombreServicio: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private location: Location,
    private categoriaService: CategoriasService,
    private route: ActivatedRoute,
  )
  {
    this.catalogoId = this.route.snapshot.params['categoriaId'];
  }

  get cantidadMinima()
  {
    return this.nuevoServicioForm.controls['cantidadMinima'];
  }
  get importe()
  {
    return this.nuevoServicioForm.controls['importe'];
  }
  get nombreServicio()
  {
    return this.nuevoServicioForm.controls['nombreServicio'];
  }

  back()
  {
    this.location.back();
  }

  async registrarCategoria()
  {
    if(this.cantidadMinima.invalid && this.importe.invalid && this.nombreServicio.invalid)
    {
      this.toast.error('Formulario incompleto');
    }
    else
    {
      this.categoriaService.crearServicio({
        cantidad_minima: parseInt(this.cantidadMinima.value ?? ''),
        catalogo_id: this.catalogoId,
        clave_servicio: this.nombreServicio.value ?? '',
        importe: parseFloat(this.importe.value ?? ''),
        nombre_servicio: this.nombreServicio.value ?? '',
      }).subscribe({
        next: () =>
        {
          this.location.back();
        },
      });
    }
  }
}
