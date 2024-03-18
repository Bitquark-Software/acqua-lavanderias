/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Sucursal, SucursalResponse } from 'src/app/dtos/sucursal';
import { Usuario } from 'src/app/dtos/usuario';
import { Role } from 'src/app/enums/Role.enum';
import { AuthService } from 'src/app/services/auth-service.service';
import { SucursalesService } from 'src/app/services/sucursales.service';

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
    role: [Role.Cajero, Validators.required],
    password: ['', Validators.required],
    idSucursal: ['', Validators.required],
  });
  isLoading = false;
  sucursales: Sucursal[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private location: Location,
    private empleadosService: AuthService,
    private sucursalesService: SucursalesService,
  )
  {
    this.fetchSucursales();
  }

  fetchSucursales()
  {
    this.sucursalesService.fetchSucursales().subscribe({
      next: (sucursalResponse: SucursalResponse) => this.sucursales = sucursalResponse.data,
    });
  }

  get nombre()
  {
    return this.nuevoUsuarioForm.controls['nombre'];
  }
  get email()
  {
    return this.nuevoUsuarioForm.controls['email'];
  }
  get role()
  {
    return this.nuevoUsuarioForm.controls['role'];
  }
  get password()
  {
    return this.nuevoUsuarioForm.controls['password'];
  }
  get idSucursal()
  {
    return this.nuevoUsuarioForm.controls['idSucursal'];
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
      role: this.role.value ?? Role.Cajero,
      id_sucursal: Number(this.idSucursal.value) ?? 1,
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
