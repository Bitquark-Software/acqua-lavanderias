/* eslint-disable no-unused-vars */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StatsService } from 'src/app/services/stats-service.service';

@Component({
  selector: 'app-pdfpreview',
  templateUrl: './pdfpreview.component.html',
  styleUrls: ['./pdfpreview.component.scss'],
})
export class PDFPreviewComponent
{

  isLoading!: true;
  NO_DATA_DEFAULT_MESSAGE = 'SIN DATOS PAR MOSTRAR';
  @Input() start?: Date;
  @Input() end?: Date;

  @Output() printAction = new EventEmitter<void>();

  constructor(private statsService: StatsService)
  {
    this.fetchData();
  }

  fetchData()
  {
    this.statsService.getDataForPDFReport(
      this.start?.toISOString(), this.end?.toISOString()).subscribe();
  }

  print()
  {
    this.printAction.emit();
  }

}
