/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-nuevo-catalogo',
  templateUrl: './nuevo-catalogo.component.html',
  styleUrls: ['./nuevo-catalogo.component.scss'],
})
export class NuevoCatalogoComponent {
  nuevaCategoriaForm = this.fb.group({
    nombre: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private location: Location,
  ) {
    //
  }

  get nombre(){
    return this.nuevaCategoriaForm.controls['nombre'];
  }

  back() {
    this.location.back();
  }

  async registrarCategoria(){
    this.toast.success('Categoría registrada', {
      icon: '✅',
    });
  }
}
