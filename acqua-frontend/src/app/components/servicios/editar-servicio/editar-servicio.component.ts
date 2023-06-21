/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Servicio } from 'src/app/dtos/servicio';

@Component({
  selector: 'app-editar-servicio',
  templateUrl: './editar-servicio.component.html',
  styleUrls: ['./editar-servicio.component.scss'],
})
export class EditarServicioComponent {
  servicio: Servicio;

  updateServicioForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private toast: HotToastService,
    private fb: FormBuilder,
    private location: Location,
  ){
    const servicioId = this.route.snapshot.params['id'];
    this.servicio = new Servicio({
      id: servicioId,
      cantidadMinima: 3,
      catalogoId: 1,
      claveServicio: 'LAVPRE',
      importe: 80,
      nombreServicio: 'Lavandería Premium',
    });

    this.updateServicioForm = this.fb.group({
      cantidadMinima: [this.servicio.cantidadMinima, [Validators.required, Validators.min(1)]],
      importe: [this.servicio.importe, [Validators.required, Validators.min(1)]],
      nombreServicio: [this.servicio.nombreServicio, Validators.required],
    });
  }

  async update(){
    this.toast.success('Servicio actualizado', { icon: '✅' });
  }

  back() {
    this.location.back();
  }

  get cantidadMinima(){
    return this.updateServicioForm.controls['cantidadMinima'];
  }
  get importe(){
    return this.updateServicioForm.controls['importe'];
  }
  get nombreServicio(){
    return this.updateServicioForm.controls['nombreServicio'];
  }

}
