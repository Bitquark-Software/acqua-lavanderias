/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-unused-vars */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ReporteStats, UsuariosReporteStats } from 'src/app/dtos/reporte-stats';
import { StatsService } from 'src/app/services/stats-service.service';
import { PDFReporteStats } from 'src/app/dtos/reporte-stats';
import * as moment from 'moment';
import { AuthService } from 'src/app/services/auth-service.service';
import { Role } from 'src/app/enums/Role.enum';

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
  @ViewChild('contenidoPDF') contenidoPDF!: ElementRef;

  dateRangePlaceholder = '';
  startDate!: Date;
  endDate!: Date;

  datesForm!: FormGroup;

  isLoading = false;
  Role = Role;
  userRole: Role | undefined = undefined;

  statsIngresos!: ReporteStats;
  statsUsuarios!: UsuariosReporteStats;
  statsPDFReporte!: PDFReporteStats;

  constructor(
    private authService: AuthService,
    private statsService: StatsService,
    private fb: FormBuilder,
  )
  {
    this.fetchStats();
    this.datesForm = this.fb.group({
      start: ['', [Validators.required]],
      end: ['', [Validators.required]],
    }, { validator: dateRangeValidator() });
    this.userRole = this.authService.session?.datos.role;
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

  private descargarArchivo(response: string, nombre: string): void
  {
    const byteArray = new Uint8Array(atob(response).split('').map(char => char.charCodeAt(0)));
    const pdfBlob = new Blob([byteArray], {type: 'application/pdf'});

    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.setAttribute('style', 'display: none');
    link.href = url;
    link.download = nombre;
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
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

  descargarReporteVentasPDF()
  {
    const start = moment(this.startDate).format('YYYY-MM-DD HH:mm:ss');
    const end = moment(this.endDate).format('YYYY-MM-DD HH:mm:ss');
    const nombre = 'Reporte de Ventas General';

    this.isLoading = true;
    this.statsService.getReportPDF(start, end).subscribe({
      next: (response) =>
      {
        this.isLoading = false;
        this.descargarArchivo(response, nombre);
      },
      error: (err) =>
      {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  descargarReporteDetallado()
  {
    const start = moment(this.startDate).format('YYYY-MM-DD HH:mm:ss');
    const end = moment(this.endDate).format('YYYY-MM-DD HH:mm:ss');
    const nombre = 'Reporte detallado';

    this.isLoading = true;
    this.statsService.getReporteDetalladoPDF(start, end).subscribe({
      next: (response) =>
      {
        this.isLoading = false;
        this.descargarArchivo(response, nombre);
      },
      error: (err) =>
      {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  descargarReporteProduccionPorProcesos()
  {
    const start = moment(this.startDate).format('YYYY-MM-DD HH:mm:ss');
    const end = moment(this.endDate).format('YYYY-MM-DD HH:mm:ss');
    const nombre = 'Reporte de producción por procesos';

    this.isLoading = true;
    this.statsService.getReporteProduccionProcesosPDF(start, end).subscribe({
      next: (response) =>
      {
        this.isLoading = false;
        this.descargarArchivo(response, nombre);
      },
      error: (err) =>
      {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  descargarReporteProduccionPorUsuario()
  {
    const start = moment(this.startDate).format('YYYY-MM-DD HH:mm:ss');
    const end = moment(this.endDate).format('YYYY-MM-DD HH:mm:ss');
    const nombre = 'Reporte de producción por usuario';

    this.isLoading = true;
    this.statsService.getReporteProduccionUsuarioPDF(start, end).subscribe({
      next: (response) =>
      {
        this.isLoading = false;
        this.descargarArchivo(response, nombre);
      },
      error: (err) =>
      {
        this.isLoading = false;
        console.log(err);
      },
    });
  }
}
