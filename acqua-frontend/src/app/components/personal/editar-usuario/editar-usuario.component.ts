/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Usuario } from 'src/app/dtos/usuario';
import { Rol } from 'src/app/enums/Rol.enum';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.scss'],
})
export class EditarUsuarioComponent {
  usuario: Usuario;
  updateUsuarioForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private toast: HotToastService,
    private fb: FormBuilder,
    private location: Location,
  ){
    const userId = this.route.snapshot.params['id'];
    this.usuario = new Usuario({
      id: userId,
      email: 'fernando@gmail.com',
      nombre: 'Fernando Morales',
      rol: Rol.Administrador,
    });
    this.updateUsuarioForm = this.fb.group({
      nombre: [this.usuario.nombre ?? '', Validators.required],
      email: [this.usuario.email ?? '', [Validators.required, Validators.email]],
      rol: [this.usuario.rol, Validators.required],
    });
  }

  async updateUsuario(){
    this.toast.success('Usuario actualizado', { icon: '✅' });
  }

  back() {
    this.location.back();
  }

  get nombre(){
    return this.updateUsuarioForm.controls['nombre'];
  }
  get email(){
    return this.updateUsuarioForm.controls['email'];
  }
  get rol(){
    return this.updateUsuarioForm.controls['rol'];
  }
}
