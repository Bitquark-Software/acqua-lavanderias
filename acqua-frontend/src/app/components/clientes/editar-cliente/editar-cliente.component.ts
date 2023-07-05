/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Cliente } from 'src/app/dtos/cliente';
import { Ubicacion } from 'src/app/dtos/ubicacion';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.scss'],
})
export class EditarClienteComponent
{
  cliente: Cliente;
  ubicaciones: Ubicacion[];
  cursor = 0;

  clienteForm: FormGroup;
  ubicacionForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private toast: HotToastService,
    private fb: FormBuilder,
    private location: Location,
  )
  {
    const clienteId = this.route.snapshot.params['clientId'];
    this.cliente = new Cliente({
      id: clienteId,
      email: 'fernando@gmail.com',
      nombre: 'Fernando',
      telefono: '9611003141',
      ubicaciones: [],
    });
    this.ubicaciones = this.cliente.ubicaciones ?? [];
    this.clienteForm = this.fb.group({
      nombre: [this.cliente.nombre, Validators.required],
      email: [this.cliente.email, Validators.email],
      telefono: [this.cliente.telefono, Validators.pattern('^[0-9]{10}$')],
    });
    this.ubicacionForm = this.fb.group({
      direccion: ['', [Validators.required]],
      colonia: ['', [Validators.required]],
      codigoPostal:
        ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      nombreDireccion: ['', [Validators.required]],
    });
  }

  async updateCliente()
  {
    this.toast.success('Cliente actualizado', { icon: '✅' });
  }

  async addDireccion()
  {
    this.ubicaciones.push({
      id: Math.floor(Math.random() * 20),
      nombre: this.nombreDireccion.value,
      direccion: this.direccion.value,
      colonia: this.colonia.value,
      codigoPostal: this.codigoPostal.value,
      ciudad: '',
      numero: 0,
    });

    this.ubicacionForm.reset();
    this.toast.success('Direccion agregada', { icon: '✅' });
  }

  eliminarDireccion(id: number)
  {
    const index = this.ubicaciones.findIndex(u => u.id === id);
    if(index >= 0)
    {
      this.ubicaciones.splice(index, 1);
      this.toast.success('Direccion eliminada', { icon: '✅' });
    }
    else
    {
      this.toast.warning('Esta ubicacion ya no existe, recargar la página puede ayudar', { icon: '😉' });
    }
  }

  back()
  {
    this.location.back();
  }

  changeCursor(index:number)
  {
    this.cursor = index;
  }

  // getters for cliente form
  get nombre()
  {
    return this.clienteForm.controls['nombre'];
  }
  get email()
  {
    return this.clienteForm.controls['email'];
  }
  get telefono()
  {
    return this.clienteForm.controls['telefono'];
  }

  // getters for ubicacion form
  get direccion()
  {
    return this.ubicacionForm.controls['direccion'];
  }
  get colonia()
  {
    return this.ubicacionForm.controls['colonia'];
  }
  get codigoPostal()
  {
    return this.ubicacionForm.controls['codigoPostal'];
  }
  get nombreDireccion()
  {
    return this.ubicacionForm.controls['nombreDireccion'];
  }
}
