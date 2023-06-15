import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { NuevoCatalogoComponent } from './components/catalogo/nuevo-catalogo/nuevo-catalogo.component';

import { HotToastModule } from '@ngneat/hot-toast';

@NgModule ( {
  declarations: [
    AppComponent,
    LoginComponent,
    DrawerComponent,
    DashboardComponent,
    CatalogoComponent,
    NuevoCatalogoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HotToastModule.forRoot({
      dismissible: true,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
} )
export class AppModule { }
