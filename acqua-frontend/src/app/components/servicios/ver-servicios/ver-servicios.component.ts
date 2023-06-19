/* eslint-disable no-unused-vars */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Catalogo } from 'src/app/dtos/catalogo';
import { Servicio } from 'src/app/dtos/servicio';

@Component({
  selector: 'app-ver-servicios',
  templateUrl: './ver-servicios.component.html',
  styleUrls: ['./ver-servicios.component.scss'],
})
export class VerServiciosComponent {
  servicios: Servicio[];
  categoria: Catalogo;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
  ){
    const catalogoId = this.route.snapshot.params['categoriaId'];
    this.categoria = new Catalogo(catalogoId, 'Lavandería');
    this.servicios = [
      {
        id: 1,
        cantidadMinima: 3,
        catalogoId: 1,
        claveServicio: 'LAVPRE',
        importe: 80,
        nombreServicio: 'LAVANDERIA PREMIUM',
      },
      {
        id: 2,
        cantidadMinima: 3,
        catalogoId: 1,
        claveServicio: 'LAVEXP',
        importe: 60,
        nombreServicio: 'LAVANDERIA EXPRESS',
      },
    ];
  }

  back() {
    this.location.back();
  }
}
