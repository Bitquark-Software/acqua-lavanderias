/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Usuario } from 'src/app/dtos/usuario';
import { Role } from 'src/app/enums/Role.enum';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.scss'],
})
export class EditarUsuarioComponent
{
  isLoading = true;
  usuario!: Usuario;
  updateUsuarioForm: FormGroup;
  isUpdating = false;

  constructor(
    private route: ActivatedRoute,
    private toast: HotToastService,
    private fb: FormBuilder,
    private location: Location,
    private empleadosService: AuthService,
  )
  {
    const userId = this.route.snapshot.params['id'];
    this.fetchUsuario(userId);
    this.updateUsuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
    });
  }

  fetchUsuario(id: number)
  {
    this.empleadosService.getPerfil(id).subscribe({
      next: (response:any) =>
      {
        this.usuario = response as Usuario;
        this.isLoading = false;
        this.updateUsuarioForm = this.fb.group({
          nombre: [response.name, Validators.required],
          email: [response.email, [Validators.required, Validators.email]],
          role: [response.role, Validators.required],
        });
      },
      error: (err) =>
      {
        this.toast.error(`Error: ${err.message ?? 'Desconocido'}`);
      },
    });
  }

  async updateUsuario()
  {
    this.isUpdating = true;
    this.empleadosService.actualizarEmpleado(
      this.usuario.id,
      this.nombre.value ?? '',
      this.email.value ?? '',
      this.role.value ?? Role.Cajero,
    ).subscribe({
      next: () =>
      {
        this.isUpdating = false;
        this.toast.success('Usuario actualizado', { icon: '✅' });
        this.location.back();
      },
      error: (err) =>
      {
        this.isUpdating = false;
      },
    });
  }

  back()
  {
    this.location.back();
  }

  get nombre()
  {
    return this.updateUsuarioForm.controls['nombre'];
  }
  get email()
  {
    return this.updateUsuarioForm.controls['email'];
  }
  get role()
  {
    return this.updateUsuarioForm.controls['role'];
  }
}
