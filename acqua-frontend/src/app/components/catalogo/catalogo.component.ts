import { Component } from '@angular/core';
import { Catalogo } from 'src/app/dtos/catalogo';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
})
export class CatalogoComponent {
  catalogos: Catalogo[] = [
    {
      id: 1,
      nombre: 'Lavandería',
    },
    {
      id: 2,
      nombre: 'Ropa de cama',
    },
    {
      id: 3,
      nombre: 'Tintorería',
    },
  ];
}
