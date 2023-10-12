/* eslint-disable no-unused-vars */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { PDFReporteStats } from 'src/app/dtos/reporte-stats';
import { StatsService } from 'src/app/services/stats-service.service';
import * as moment from 'moment';
import jsPDF from 'jspdf';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const html2pdf = require('html2pdf.js');

@Component({
  selector: 'app-pdfpreview',
  templateUrl: './pdfpreview.component.html',
  styleUrls: ['./pdfpreview.component.scss'],
})
export class PDFPreviewComponent
{

  isLoading = true;
  isDownloadingPdf = false;
  NO_DATA_DEFAULT_MESSAGE = 'SIN DATOS PAR MOSTRAR';

  pdfReporteStats!: PDFReporteStats;

  startDate?: Date;
  endDate?: Date;

  @ViewChild('reporteTable') reporteTable!: ElementRef;

  constructor(private statsService: StatsService)
  {
    //
  }

  fetchData(start?: Date, end?: Date)
  {
    const startDate = start ? moment(start).format('YYYY-MM-DD HH:mm:ss') : undefined;
    const endDate = end ? moment(end).format('YYYY-MM-DD HH:mm:ss') : undefined;
    this.startDate = start;
    this.endDate = end;

    this.statsService.getDataForPDFReport(startDate, endDate).subscribe({
      next: (reporteStats) =>
      {
        this.isLoading = false;
        this.pdfReporteStats = reporteStats;
      },
    });
  }

  async downloadReportInPdf()
  {
    this.isDownloadingPdf = true;

    window.print();

    this.isDownloadingPdf = false;
  }

}
