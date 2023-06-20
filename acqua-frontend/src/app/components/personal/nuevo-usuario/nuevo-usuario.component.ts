/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Rol } from 'src/app/enums/Rol.enum';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  styleUrls: ['./nuevo-usuario.component.scss'],
})
export class NuevoUsuarioComponent {
  nuevoUsuarioForm = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rol: [Rol.Empleado, Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private location: Location,
  ) {
    //
  }

  get nombre(){
    return this.nuevoUsuarioForm.controls['nombre'];
  }
  get email(){
    return this.nuevoUsuarioForm.controls['email'];
  }
  get rol(){
    return this.nuevoUsuarioForm.controls['rol'];
  }
  get password(){
    return this.nuevoUsuarioForm.controls['password'];
  }

  back() {
    this.location.back();
  }

  async registrar(){
    this.toast.success('Usuario registrado', { icon: '✅' });
  }
}
