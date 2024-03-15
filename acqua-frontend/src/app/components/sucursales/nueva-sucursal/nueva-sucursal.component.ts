/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Sucursal } from 'src/app/dtos/sucursal';
import { SucursalesService } from 'src/app/services/sucursales.service';

@Component({
  selector: 'app-nueva-sucursal',
  templateUrl: './nueva-sucursal.component.html',
  styleUrls: ['./nueva-sucursal.component.scss'],
})
export class NuevaSucursalComponent
{
  nuevaSucursalForm = this.fb.group({
    nombre: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private location: Location,
    private sucursalesService: SucursalesService,
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
    const sucursalPayload: Partial<Sucursal> = {
      nombre: this.nuevaSucursalForm.controls['nombre'].value ?? '',
    };

    this.sucursalesService.registrarSucursal(sucursalPayload).subscribe({
      next: () => this.back(),
      error: (error) => console.log(error),
    });
  }
}
