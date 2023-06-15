import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { authGuard } from './guards/auth.guard';
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

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'categorias',
    component: CatalogoComponent,
  },
  {
    path: 'nueva-categoria',
    component: NuevoCatalogoComponent,
  },
  {
    path: 'editar-categoria/:id',
    component: EditarCatalogoComponent,
  },
  {
    path: 'ver-servicios/:categoriaId',
    component: VerServiciosComponent,
  },
  {
    path: 'editar-servicio/:servicioId',
    component: EditarServicioComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    // canActivate: [authGuard],
  },
  {
    path: 'personal',
    component: PersonalComponent,
  },
  {
    path: 'nuevo-usuario',
    component: NuevoUsuarioComponent,
  },
  {
    path: 'editar-usuario/:id',
    component: EditarUsuarioComponent,
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
