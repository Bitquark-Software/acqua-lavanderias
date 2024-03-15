/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { DiaHorarioSucursal, Sucursal } from 'src/app/dtos/sucursal';
import { SucursalesService } from 'src/app/services/sucursales.service';

@Component({
  selector: 'app-editar-sucursal',
  templateUrl: './editar-sucursal.component.html',
  styleUrls: ['./editar-sucursal.component.scss'],
})
export class EditarSucursalComponent
{
  sucursal!: Sucursal;
  sucursalForm!: FormGroup;
  horarioSucursalForm!: FormGroup;

  format_24_hrs: string[] = [];
  diasHorarioSucursal: DiaHorarioSucursal[] = [];

  constructor(
    private route: ActivatedRoute,
    private toast: HotToastService,
    private fb: FormBuilder,
    private location: Location,
    private sucursalesService: SucursalesService,
  )
  {
    const sucursalId = this.route.snapshot.params['sucursalId'];
    this.fetchSucursal(sucursalId);

    this.horarioSucursalForm = this.fb.group({
      dias: ['', Validators.required],
      horarioApertura: ['', Validators.required],
      horarioCierre: ['', Validators.required],
    });

    // Inicializar opciones de horas (0 a 23)
    for (let hour = 0; hour < 24; hour++)
    {
      this.format_24_hrs.push(hour.toString().padStart(2, '0'));
    }

    this.initDiasHorarioSucursal();
  }

  private initDiasHorarioSucursal()
  {
    this.diasHorarioSucursal.push(DiaHorarioSucursal.LUNES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.LUNES_A_JUEVES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.LUNES_A_VIERNES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.LUNES_A_SABADO);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.LUNES_A_DOMINGO);

    this.diasHorarioSucursal.push(DiaHorarioSucursal.MARTES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.MARTES_A_MIERCOLES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.MARTES_A_JUEVES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.MARTES_A_VIERNES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.MARTES_A_SABADO);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.MARTES_A_DOMINGO);

    this.diasHorarioSucursal.push(DiaHorarioSucursal.MIERCOLES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.MIERCOLES_A_JUEVES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.MIERCOLES_A_VIERNES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.MIERCOLES_A_SABADO);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.MIERCOLES_A_DOMINGO);

    this.diasHorarioSucursal.push(DiaHorarioSucursal.JUEVES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.JUEVES_A_VIERNES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.JUEVES_A_SABADO);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.JUEVES_A_DOMINGO);

    this.diasHorarioSucursal.push(DiaHorarioSucursal.VIERNES);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.VIERNES_A_SABADO);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.VIERNES_A_DOMINGO);

    this.diasHorarioSucursal.push(DiaHorarioSucursal.SABADO);
    this.diasHorarioSucursal.push(DiaHorarioSucursal.SABADO_A_DOMINGO);

    this.diasHorarioSucursal.push(DiaHorarioSucursal.DOMINGO);
  }

  async fetchSucursal(id: number)
  {
    this.sucursalesService.fetchSucursalById(id).subscribe({
      next: (sucursal: Sucursal) =>
      {
        this.sucursal = sucursal;
        this.initSucursalForm();
      },
      error: (error) =>
      {
        console.error(error);
        this.toast.error('Este cliente no existe');
        this.location.back();
      },
    });
  }

  initSucursalForm()
  {
    this.sucursalForm = this.fb.group({
      nombre: [this.sucursal.nombre, Validators.required],
    });
  }

  async updateSucursal()
  {
    this.sucursal = this.nombre.value;

    if(this.sucursal.id)
    {
      this.sucursalesService.actualizarSucursal(this.sucursal.id, this.sucursal).subscribe({
        next: () => { this.location.back(); },
      });
    }
  }

  get nombre()
  {
    return this.sucursalForm.controls['nombre'];
  }

  back()
  {
    this.location.back();
  }

  eliminarHorario(id: number)
  {
    this.sucursalesService.eliminarHorario(id).subscribe({
      next: () => this.fetchSucursal(this.sucursal.id),
    });
  }

  addHorario()
  {
    const dias = this.dias.value;
    const apertura = this.horarioApertura.value;
    const cierre = this.horarioCierre.value;

    this.sucursalesService.agregarHorario(this.sucursal.id, dias, apertura, cierre).subscribe({
      next: () =>
      {
        this.fetchSucursal(this.sucursal.id);
        this.horarioSucursalForm.reset();
      },
      error: () => this.horarioSucursalForm.reset(),
    });

  }

  get dias()
  {
    return this.horarioSucursalForm.controls['dias'];
  }
  get horarioApertura()
  {
    return this.horarioSucursalForm.controls['horarioApertura'];
  }
  get horarioCierre()
  {
    return this.horarioSucursalForm.controls['horarioCierre'];
  }
}
