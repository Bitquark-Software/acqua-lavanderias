/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Cliente } from 'src/app/dtos/cliente';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-nuevo-cliente',
  templateUrl: './nuevo-cliente.component.html',
  styleUrls: ['./nuevo-cliente.component.scss'],
})
export class NuevoClienteComponent
{
  nuevoClienteForm = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', Validators.email],
    telefono: ['', [Validators.pattern('^[0-9]{10}$'), Validators.required]],
    addUbicaciones: [false],
  });

  ubicacionForm = this.fb.group({
    calle: ['', this.addUbicaciones.value ? [Validators.required] : []],
    numero: ['', this.addUbicaciones.value ? [Validators.required] : []],
    colonia: ['', this.addUbicaciones.value ? [Validators.required] : []],
    ciudad: ['', this.addUbicaciones.value ? [Validators.required] : []],
    codigoPostal:
      ['', this.addUbicaciones.value ? [Validators.required, Validators.pattern('^[0-9]{5}$')] : []],
    nombreDireccion: ['', this.addUbicaciones.value ? [Validators.required] : []],
  });

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private location: Location,
    private clientesService: ClientesService,
  )
  {
    //
  }

  back()
  {
    this.location.back();
  }

  async registrar()
  {
    let clientePayload: Cliente;

    if(this.nuevoClienteForm.controls['addUbicaciones'].value == false)
    {
      clientePayload = {
        nombre: this.nuevoClienteForm.controls['nombre'].value ?? '',
        email: this.nuevoClienteForm.controls['email'].value ?? '',
        telefono: this.nuevoClienteForm.controls['telefono'].value ?? '',
      };
    }
    else
    {
      clientePayload = {
        nombre: this.nuevoClienteForm.controls['nombre'].value ?? '',
        email: this.nuevoClienteForm.controls['email'].value ?? '',
        telefono: this.nuevoClienteForm.controls['telefono'].value ?? '',
        ubicaciones: [
          {
            ciudad: this.ubicacionForm.controls['ciudad'].value ?? '',
            codigoPostal:
              parseInt(this.ubicacionForm.controls['codigoPostal'].value?.toString() ??'') ?? 0,
            colonia: this.ubicacionForm.controls['colonia'].value ?? '',
            direccion: this.ubicacionForm.controls['calle'].value ?? '',
            nombre: this.ubicacionForm.controls['nombreDireccion'].value ?? '',
            numero:
              parseInt(this.ubicacionForm.controls['numero'].value?.toString() ?? '') ?? '',
          },
        ],
      };
    }

    console.log(clientePayload);

    this.clientesService.registrarCliente(clientePayload);
  }

  get addUbicaciones()
  {
    return this.nuevoClienteForm.controls['addUbicaciones'];
  }

  reRenderUbicacionesForm()
  {
    this.ubicacionForm = this.fb.group({
      calle: ['', this.addUbicaciones.value ? [Validators.required] : []],
      numero: ['', this.addUbicaciones.value ? [Validators.required] : []],
      colonia: ['', this.addUbicaciones.value ? [Validators.required] : []],
      ciudad: ['', this.addUbicaciones.value ? [Validators.required] : []],
      codigoPostal:
      ['', this.addUbicaciones.value ? [Validators.required, Validators.pattern('^[0-9]{5}$')] : []],
      nombreDireccion: ['', this.addUbicaciones.value ? [Validators.required] : []],
    });
  }
}
