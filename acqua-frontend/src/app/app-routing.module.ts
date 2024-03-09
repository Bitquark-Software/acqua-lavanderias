import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { NuevoCatalogoComponent } from './components/catalogo/nuevo-catalogo/nuevo-catalogo.component';
import {
  EditarCatalogoComponent,
} from './components/catalogo/editar-catalogo/editar-catalogo.component';
import { VerServiciosComponent } from './components/servicios/ver-servicios/ver-servicios.component';
import {
  EditarServicioComponent,
} from './components/servicios/editar-servicio/editar-servicio.component';
import { PersonalComponent } from './components/personal/personal.component';
import { NuevoUsuarioComponent } from './components/personal/nuevo-usuario/nuevo-usuario.component';
import { EditarUsuarioComponent } from './components/personal/editar-usuario/editar-usuario.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { NuevoClienteComponent } from './components/clientes/nuevo-cliente/nuevo-cliente.component';
import { EditarClienteComponent } from './components/clientes/editar-cliente/editar-cliente.component';
import { NuevoServicioComponent } from './components/servicios/nuevo-servicio/nuevo-servicio.component';
import { TicketsComponent } from './components/tickets/tickets.component';
import { DetallesTicketComponent } from './components/tickets/detalles-ticket/detalles-ticket.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { Role } from './enums/Role.enum';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'categorias',
    component: CatalogoComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Encargado, Role.Cajero] },
  },
  {
    path: 'nueva-categoria',
    component: NuevoCatalogoComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Encargado] },
  },
  {
    path: 'editar-categoria/:id',
    component: EditarCatalogoComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Encargado] },
  },
  {
    path: 'ver-servicios/:categoriaId',
    component: VerServiciosComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Encargado, Role.Cajero] },
  },
  {
    path: 'nuevo-servicio/:categoriaId',
    component: NuevoServicioComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Encargado] },
  },
  {
    path: 'editar-servicio/:servicioId',
    component: EditarServicioComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Encargado] },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Encargado, Role.Cajero] },
  },
  {
    path: 'personal',
    component: PersonalComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador] },
  },
  {
    path: 'nuevo-usuario',
    component: NuevoUsuarioComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador] },
  },
  {
    path: 'editar-usuario/:id',
    component: EditarUsuarioComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador] },
  },
  {
    path: 'clientes',
    component: ClientesComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Cajero] },
  },
  {
    path: 'nuevo-cliente',
    component: NuevoClienteComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Cajero] },
  },
  {
    path: 'editar-cliente/:clientId',
    component: EditarClienteComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Cajero, Role.Operativo, Role.Encargado] },
  },
  {
    path: 'tickets',
    component: TicketsComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Operativo, Role.Cajero, Role.Encargado] },
  },
  {
    path: 'ticket/:id',
    component: DetallesTicketComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Operativo, Role.Cajero, Role.Encargado] },
  },
  {
    path: 'reportes',
    component: ReportesComponent,
    canActivate: [authGuard],
    data: { roles: [Role.Administrador, Role.Encargado] },
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
    data: { roles: [Role.Administrador, Role.Encargado, Role.Cajero] },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
    data: { roles: [Role.Administrador, Role.Encargado, Role.Cajero] },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
