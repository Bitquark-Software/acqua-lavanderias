/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-nuevo-cliente',
  templateUrl: './nuevo-cliente.component.html',
  styleUrls: ['./nuevo-cliente.component.scss'],
})
export class NuevoClienteComponent {
  nuevoClienteForm = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', Validators.email],
    telefono: ['', Validators.pattern('^[0-9]{10}$')],
    addUbicaciones: [false],
  });

  ubicacionForm = this.fb.group({
    direccion: ['', this.addUbicaciones.value ? [Validators.required] : []],
    colonia: ['', this.addUbicaciones.value ? [Validators.required] : []],
    codigoPostal:
      ['', this.addUbicaciones.value ? [Validators.required, Validators.pattern('^[0-9]{5}$')] : []],
    nombreDireccion: ['', this.addUbicaciones.value ? [Validators.required] : []],
  });

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private location: Location,
  ) {
    //
  }

  back() {
    this.location.back();
  }

  async registrar(){
    this.toast.success('Usuario registrado', { icon: '✅' });
  }

  get addUbicaciones(){
    return this.nuevoClienteForm.controls['addUbicaciones'];
  }

  reRenderUbicacionesForm(){
    this.ubicacionForm = this.fb.group({
      direccion: ['', this.addUbicaciones.value ? [Validators.required] : []],
      colonia: ['', this.addUbicaciones.value ? [Validators.required] : []],
      codigoPostal:
        ['', this.addUbicaciones.value ? [Validators.required, Validators.pattern('^[0-9]{5}$')] : []],
      nombreDireccion: ['', this.addUbicaciones.value ? [Validators.required] : []],
    });
  }
}
