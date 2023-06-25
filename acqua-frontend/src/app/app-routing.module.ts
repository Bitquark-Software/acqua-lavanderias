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

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'categorias',
    component: CatalogoComponent,
    canActivate: [authGuard],
  },
  {
    path: 'nueva-categoria',
    component: NuevoCatalogoComponent,
    canActivate: [authGuard],
  },
  {
    path: 'editar-categoria/:id',
    component: EditarCatalogoComponent,
    canActivate: [authGuard],
  },
  {
    path: 'ver-servicios/:categoriaId',
    component: VerServiciosComponent,
    canActivate: [authGuard],
  },
  {
    path: 'nuevo-servicio/:categoriaId',
    component: NuevoServicioComponent,
    canActivate: [authGuard],
  },
  {
    path: 'editar-servicio/:servicioId',
    component: EditarServicioComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'personal',
    component: PersonalComponent,
    canActivate: [authGuard],
  },
  {
    path: 'nuevo-usuario',
    component: NuevoUsuarioComponent,
    canActivate: [authGuard],
  },
  {
    path: 'editar-usuario/:id',
    component: EditarUsuarioComponent,
    canActivate: [authGuard],
  },
  {
    path: 'clientes',
    component: ClientesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'nuevo-cliente',
    component: NuevoClienteComponent,
    canActivate: [authGuard],
  },
  {
    path: 'editar-cliente/:clientId',
    component: EditarClienteComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
