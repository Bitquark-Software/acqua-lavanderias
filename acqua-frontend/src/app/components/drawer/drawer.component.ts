/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { Rol } from 'src/app/enums/Rol.enum';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
})
export class DrawerComponent
{
  isAdmin = false;

  constructor(private authService: AuthService)
  {
    this.isAdmin = this.authService.session?.datos.role === Rol.Administrador ?? false;
  }
}
