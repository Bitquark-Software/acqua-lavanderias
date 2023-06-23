/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Servicio } from 'src/app/dtos/servicio';
import { CategoriasService } from 'src/app/services/categorias.service';

@Component({
  selector: 'app-editar-servicio',
  templateUrl: './editar-servicio.component.html',
  styleUrls: ['./editar-servicio.component.scss'],
})
export class EditarServicioComponent
{
  servicioId:number;
  servicio: Servicio;

  updateServicioForm: FormGroup = this.fb.group({
    cantidadMinima: ['', [Validators.required, Validators.min(1)]],
    importe: ['', [Validators.required, Validators.min(1)]],
    nombreServicio: ['', Validators.required],
  });

  constructor(
    private route: ActivatedRoute,
    private toast: HotToastService,
    private fb: FormBuilder,
    private location: Location,
    private categoriaService: CategoriasService,
  )
  {
    this.servicioId = this.route.snapshot.params['servicioId'];
    this.servicio = {} as Servicio;
    this.categoriaService.fetchServicioById(this.servicioId).subscribe({
      next: (servicio) =>
      {
        this.servicio = servicio;
        this.updateServicioForm = this.fb.group({
          cantidadMinima: [this.servicio.cantidad_minima, [Validators.required, Validators.min(1)]],
          importe: [this.servicio.importe, [Validators.required, Validators.min(1)]],
          nombreServicio: [this.servicio.nombre_servicio, Validators.required],
        });
      },
    });
  }

  async update()
  {
    this.categoriaService.actualizarServicioPorId(this.servicioId, {
      cantidad_minima: parseInt(this.cantidadMinima.value) ?? this.servicio.cantidad_minima,
      importe: parseFloat(this.importe.value) ?? this.servicio.importe,
      nombre_servicio: this.nombreServicio.value ?? this.servicio.nombre_servicio,
      catalogo_id: this.servicio.catalogo_id,
    }).subscribe({
      next: () =>
      {
        this.location.back();
      },
    });
  }

  back()
  {
    this.location.back();
  }

  get cantidadMinima()
  {
    return this.updateServicioForm.controls['cantidadMinima'];
  }
  get importe()
  {
    return this.updateServicioForm.controls['importe'];
  }
  get nombreServicio()
  {
    return this.updateServicioForm.controls['nombreServicio'];
  }

}
