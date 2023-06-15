import { Component } from '@angular/core';
import { Usuario } from 'src/app/dtos/usuario';
import { Rol } from 'src/app/enums/Rol.enum';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
})
export class PersonalComponent {
  usuarios: Usuario[];

  constructor() {
    this.usuarios = [
      {
        id: 1,
        email: 'fernando@gmail.com',
        nombre: 'Fernando Morales',
        rol: Rol.Administrador,
      },
      {
        id: 2,
        email: 'israel@gmail.com',
        nombre: 'Israel Santiago',
        rol: Rol.Empleado,
      },
    ];
  }
}
