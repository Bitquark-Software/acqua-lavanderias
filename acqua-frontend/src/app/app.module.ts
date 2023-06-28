import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { NuevoCatalogoComponent } from './components/catalogo/nuevo-catalogo/nuevo-catalogo.component';
import { HotToastModule } from '@ngneat/hot-toast';
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
import { HttpClientModule } from '@angular/common/http';
import { NuevoServicioComponent } from './components/servicios/nuevo-servicio/nuevo-servicio.component';
import { CajaComponent } from './components/caja/caja.component';

@NgModule ( {
  declarations: [
    AppComponent,
    LoginComponent,
    DrawerComponent,
    DashboardComponent,
    CatalogoComponent,
    NuevoCatalogoComponent,
    EditarCatalogoComponent,
    VerServiciosComponent,
    EditarServicioComponent,
    PersonalComponent,
    NuevoUsuarioComponent,
    EditarUsuarioComponent,
    ClientesComponent,
    NuevoClienteComponent,
    EditarClienteComponent,
    NuevoServicioComponent,
    CajaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    HotToastModule.forRoot({
      dismissible: true,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
} )
export class AppModule { }
