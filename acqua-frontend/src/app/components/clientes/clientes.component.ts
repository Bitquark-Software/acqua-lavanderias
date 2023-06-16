import { Component } from '@angular/core';
import { Cliente } from 'src/app/dtos/cliente';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent {
  clientes: Cliente[];

  constructor(){
    this.clientes = [
      {
        id: 1,
        nombre: 'Fernando',
        email: 'fernando@bitquark.com.mx',
      },
      {
        id: 2,
        nombre: 'André',
        telefono: '9610000000',
      },
    ];
  }
}
