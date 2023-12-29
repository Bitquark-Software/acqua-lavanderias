/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-unused-vars */
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { ReporteStats, UsuariosReporteStats } from 'src/app/dtos/reporte-stats';
import { StatsService } from 'src/app/services/stats-service.service';
import { PDFReporteStats } from 'src/app/dtos/reporte-stats';
import { PDFPreviewComponent } from './pdfpreview/pdfpreview.component';
import * as moment from 'moment';
const html2pdf = require('html2pdf.js');

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
  //  @ViewChild('reportePreview') reportePreview!: PDFPreviewComponent;
  @ViewChild('contenidoPDF') contenidoPDF!: ElementRef;

  dateRangePlaceholder = '';
  startDate!: Date;
  endDate!: Date;

  datesForm!: FormGroup;

  isLoading = false;

  statsIngresos!: ReporteStats;
  statsUsuarios!: UsuariosReporteStats;
  statsPDFReporte!: PDFReporteStats;

  constructor(
    private statsService: StatsService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private renderer: Renderer2,
  )
  {
    this.fetchStats();
    //    this.fetchDataReport();
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
        try
        {
          const startDate = start ? new Date(start) : undefined;
          const endDate = end ? new Date(end) : undefined;
          //          this.reportePreview.fetchData(startDate, endDate);
        }
        catch (error)
        {
          console.error(error);
        }
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

  fetchDataReport(start?: string, end?:string)
  {
    this.isLoading = true;
    this.statsService.getReportPDF(start, end).subscribe({
      next: (response) =>
      {
        this.isLoading = false;
        const dataType = response.type;
        console.log(dataType);
        const binaryData = [];
        binaryData.push(response);
        const downloadLink = document.createElement('a');
        //        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
        //        if ("getReportPDF.pdf")
        downloadLink.setAttribute('download', 'getReportPDF.pdf');
        document.body.appendChild(downloadLink);
        downloadLink.click();
      },
      error: (err) =>
      {
        this.isLoading = false;
        console.log('====> Ocurrieron algunos errores <====\n');
        console.log(err);
      },
    });
  }

  descargarReporteVentasPDF()
  {
    this.fetchDataReport(
      moment(this.startDate).format('YYYY-MM-DD HH:mm:ss'),
      moment(this.endDate).format('YYYY-MM-DD HH:mm:ss'),
    );
  }

  private descargarArchivo(response: any): void
  {
    const blob = new Blob([response.body], { type: 'application/pdf' });

    const contentDispositionHeader = response.headers.get('content-disposition');
    const fileNameMatch = contentDispositionHeader?.match(/filename="(.+)"$/);

    const fileName = fileNameMatch ? fileNameMatch[1] : 'archivo.pdf';

    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  downLoadFile(data: any, type: string)
  {
    const blob = new Blob([data], { type: type});
    const url = window.URL.createObjectURL(blob);
    const pwa = window.open(url);
    if (!pwa || pwa.closed || typeof pwa.closed == 'undefined')
    {
      alert( 'Please disable your Pop-up blocker and try again.');
    }
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
