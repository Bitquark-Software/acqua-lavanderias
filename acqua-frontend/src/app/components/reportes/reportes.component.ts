/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-unused-vars */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { ReporteStats, UsuariosReporteStats } from 'src/app/dtos/reporte-stats';
import { StatsService } from 'src/app/services/stats-service.service';
import * as moment from 'moment';

function dateRangeValidator(): ValidatorFn
{
  return (control: AbstractControl): { [key: string]: any } | null =>
  {
    const startControl = control.get('start');
    const endControl = control.get('end');

    if (!startControl || !endControl)
    {
      return null;
    }

    const startDate = new Date(startControl.value);
    const endDate = new Date(endControl.value);

    if (startDate > endDate)
    {
      return { dateRangeError: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
})
export class ReportesComponent
{
  @ViewChild('dateRange') dateRange!: ElementRef<HTMLInputElement>;
  @ViewChild('datesModal') datesModal!: ElementRef<HTMLDialogElement>;

  dateRangePlaceholder = '';
  startDate!: Date;
  endDate!: Date;

  datesForm!: FormGroup;

  isLoading = false;

  statsIngresos!: ReporteStats;
  statsUsuarios!: UsuariosReporteStats;

  constructor(
    private statsService: StatsService,
    private fb: FormBuilder,
    private toast: HotToastService,
  )
  {
    this.fetchStats();
    this.datesForm = this.fb.group({
      start: ['', [Validators.required]],
      end: ['', [Validators.required]],
    }, { validator: dateRangeValidator() });
  }

  fetchStats(start?: string, end?:string)
  {
    this.isLoading = true;
    this.statsService.getStatsIngresos(start, end).subscribe({
      next: (response) =>
      {
        this.isLoading = false;
        this.statsIngresos = response;
        this.fetchUsuariosStats(start, end);
      },
      error: (err) =>
      {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  fetchUsuariosStats(start?: string, end?:string)
  {
    this.isLoading = true;
    this.statsService.getClientesStats(start, end).subscribe({
      next: (response) =>
      {
        this.isLoading = false;
        this.statsUsuarios = response;
      },
      error: (err) =>
      {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  setDateRangePickerText()
  {
    const startDate = this.datesForm.controls['start'].value;
    const endDate = this.datesForm.controls['end'].value;

    if(!startDate || !endDate)
    {
      this.dateRangePlaceholder = '';
      this.startDate = null as unknown as Date;
      this.endDate = null as unknown as Date;
    }
    else
    {
      const start = new Date(startDate);
      const end = new Date(endDate);
      this.startDate = start;
      this.endDate = end;

      this.dateRangePlaceholder = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;

      this.fetchStats(
        moment(start).format('YYYY-MM-DD HH:mm:ss'), moment(end).format('YYYY-MM-DD HH:mm:ss'));

      this.closeDatesDialog();
      this.datesForm.reset();
    }
  }

  openDatesDialog()
  {
    this.datesModal.nativeElement.show();
  }

  closeDatesDialog(force?: boolean)
  {
    if(force)
    {
      this.dateRangePlaceholder = '';
      this.startDate = null as unknown as Date;
      this.endDate = null as unknown as Date;
      this.fetchStats();
    }

    this.datesModal.nativeElement.close();
  }

  replaceFormsubmit(event:Event)
  {
    event.preventDefault();
  }

}
