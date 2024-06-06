import { Component } from '@angular/core';
import { CajaStateService } from 'src/app/services/caja-state.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent
{
  caja_abierta!: boolean;

  constructor(private cajaStateService: CajaStateService)
  {
    //
  }

  ngOnInit()
  {
    this.cajaStateService.mostrarCajaEvent.subscribe((mostrar: boolean) =>
    {
      this.caja_abierta = mostrar;
    });
  }
}
