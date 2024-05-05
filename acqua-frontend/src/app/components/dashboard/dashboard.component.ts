import { Component } from '@angular/core';
import { CajaStateService } from 'src/app/services/caja-state.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent
{
  mostrarCaja!: boolean;

  constructor(private cajaStateService: CajaStateService)
  {
    //
  }

  ngOnInit()
  {
    this.cajaStateService.mostrarCajaEvent.subscribe((mostrar: boolean) =>
    {
      this.mostrarCaja = mostrar;
    });
  }
}
