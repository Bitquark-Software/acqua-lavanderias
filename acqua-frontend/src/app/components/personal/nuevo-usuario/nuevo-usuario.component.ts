/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Usuario } from 'src/app/dtos/usuario';
import { Rol } from 'src/app/enums/Rol.enum';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  styleUrls: ['./nuevo-usuario.component.scss'],
})
export class NuevoUsuarioComponent
{
  nuevoUsuarioForm = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rol: [Rol.Empleado, Validators.required],
    password: ['', Validators.required],
  });
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private location: Location,
    private empleadosService: AuthService,
  )
  {
    //
  }

  get nombre()
  {
    return this.nuevoUsuarioForm.controls['nombre'];
  }
  get email()
  {
    return this.nuevoUsuarioForm.controls['email'];
  }
  get rol()
  {
    return this.nuevoUsuarioForm.controls['rol'];
  }
  get password()
  {
    return this.nuevoUsuarioForm.controls['password'];
  }

  back()
  {
    this.location.back();
  }

  async registrar()
  {
    this.isLoading = true;
    const usuarioNuevo: Partial<Usuario> = {
      email: this.email.value ?? '',
      nombre: this.nombre.value ?? '',
      rol: this.rol.value ?? Rol.Empleado,
    };
    const pass = this.password.value ?? '';
    this.empleadosService.registrarEmpleado(usuarioNuevo as Usuario, pass).subscribe({
      next: () =>
      {
        this.isLoading = false;
        this.toast.success('Usuario registrado', { icon: '✅' });
        this.back();
      },
      error: (error) =>
      {
        this.isLoading = false;
        this.toast.error(`Error: ${error.message ?? 'Desconocido'}`);
      },
    });
  }
}
