import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
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
import { TicketsComponent } from './components/tickets/tickets.component';
import { DetallesTicketComponent } from './components/tickets/detalles-ticket/detalles-ticket.component';
import { TicketPreviewComponent } from './components/tickets/ticket-preview/ticket-preview.component';
import { QRCodeModule } from 'angularx-qrcode';
import { RegistrarPagoComponent } from './components/tickets/registrar-pago/registrar-pago.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import {
  ModalAgregarDireccionComponent,
} from './components/clientes/modal-agregar-direccion/modal-agregar-direccion.component';
import { PDFPreviewComponent } from './components/reportes/pdfpreview/pdfpreview.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { SucursalesComponent } from './components/sucursales/sucursales.component';
import { NuevaSucursalComponent } from './components/sucursales/nueva-sucursal/nueva-sucursal.component';
import { EditarSucursalComponent } from './components/sucursales/editar-sucursal/editar-sucursal.component';
registerLocaleData(localeEs, 'es');

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
    TicketsComponent,
    DetallesTicketComponent,
    TicketPreviewComponent,
    RegistrarPagoComponent,
    ReportesComponent,
    ModalAgregarDireccionComponent,
    PDFPreviewComponent,
    SucursalesComponent,
    NuevaSucursalComponent,
    EditarSucursalComponent,
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
    QRCodeModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  bootstrap: [AppComponent],
} )
export class AppModule { }
