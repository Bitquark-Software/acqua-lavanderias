/* eslint-disable no-unused-vars */
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Cliente } from 'src/app/dtos/cliente';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-modal-agregar-direccion',
  templateUrl: './modal-agregar-direccion.component.html',
  styleUrls: ['./modal-agregar-direccion.component.scss'],
})
export class ModalAgregarDireccionComponent
{

  @Input() cliente!: Cliente;
  @ViewChild('modalNuevaDireccion') modalNuevaDireccion!: ElementRef<HTMLDialogElement>;

  @Output() direccionAgregadaEvent = new EventEmitter<void>();

  ubicacionForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClientesService,
    private toast: HotToastService,
  )
  {
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

  openModal()
  {
    this.modalNuevaDireccion.nativeElement.showModal();
  }

  overrideModalSubmit(event: Event)
  {
    event.preventDefault();
    this.modalNuevaDireccion.nativeElement.close();
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
        this.direccionAgregadaEvent.emit();
        this.ubicacionForm.reset();
        this.modalNuevaDireccion.nativeElement.close();
      },
      error: (err) =>
      {
        this.toast.error(`${err.error.message ?? 'Error al registrar la dirección'}`);
        console.error(err);
        this.direccionAgregadaEvent.emit();
        this.ubicacionForm.reset();
        this.modalNuevaDireccion.nativeElement.close();
      },
    });
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
