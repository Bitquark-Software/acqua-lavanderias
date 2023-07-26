/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Cliente } from 'src/app/dtos/cliente';
import { Ubicacion } from 'src/app/dtos/ubicacion';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.scss'],
})
export class EditarClienteComponent
{
  cliente!: Cliente;
  ubicaciones!: Ubicacion[];
  cursor = 0;

  clienteForm!: FormGroup;
  ubicacionForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private toast: HotToastService,
    private fb: FormBuilder,
    private location: Location,
    private clienteService: ClientesService,
  )
  {
    const clienteId = this.route.snapshot.params['clientId'];
    this.fetchCliente(clienteId);
  }

  async fetchCliente(id: number)
  {
    this.clienteService.fetchClienteById(id).subscribe({
      next: (cliente: Cliente) =>
      {
        this.cliente = cliente;
        this.ubicaciones = cliente.direccion ?? [];
        this.initClienteForms();
      },
      error: (error) =>
      {
        console.error(error);
        this.toast.error('Este cliente no existe');
        this.location.back();
      },
    });
  }

  initClienteForms()
  {
    this.clienteForm = this.fb.group({
      nombre: [this.cliente.nombre, Validators.required],
      email: [this.cliente.email, Validators.email],
      telefono: [this.cliente.telefono, Validators.pattern('^[0-9]{10}$')],
    });
    this.ubicacionForm = this.fb.group({
      calle: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      colonia: ['', [Validators.required]],
      codigoPostal:
        ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      nombreDireccion: ['', [Validators.required]],
    });
  }

  async updateCliente()
  {
    this.cliente.nombre = this.nombre.value;
    this.cliente.telefono = this.telefono.value;
    this.cliente.email = this.email.value;

    console.log(this.cliente);

    if(this.cliente.id)
    {
      this.clienteService.actualizarCliente(this.cliente.id, this.cliente).subscribe({
        next: () =>
        {
          //
        },
      });
    }
  }

  async addDireccion()
  {
    this.clienteService.registrarUbicacion({
      calle: this.calle.value,
      ciudad: this.ciudad.value,
      codigo_postal: this.codigoPostal.value,
      colonia: this.colonia.value,
      nombre_ubicacion: this.nombreDireccion.value,
      numero: this.numero.value,
    }, this.cliente.id ?? 0).subscribe({
      next: () =>
      {
        this.fetchCliente(this.cliente.id ?? 0);
        this.ubicacionForm.reset();
      },
      error: (err) =>
      {
        console.error(err);
      },
    });
  }

  eliminarDireccion(id: number)
  {
    this.clienteService.eliminarDireccion(id).subscribe({
      next: () =>
      {
        this.fetchCliente(this.cliente.id ?? 0);
      },
    });
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
  get calle()
  {
    return this.ubicacionForm.controls['calle'];
  }
  get numero()
  {
    return this.ubicacionForm.controls['numero'];
  }
  get colonia()
  {
    return this.ubicacionForm.controls['colonia'];
  }
  get codigoPostal()
  {
    return this.ubicacionForm.controls['codigoPostal'];
  }
  get ciudad()
  {
    return this.ubicacionForm.controls['ciudad'];
  }
  get nombreDireccion()
  {
    return this.ubicacionForm.controls['nombreDireccion'];
  }
}
