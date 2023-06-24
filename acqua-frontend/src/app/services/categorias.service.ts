/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthService } from './auth-service.service';
import { HotToastService } from '@ngneat/hot-toast';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Catalogo, Categoria } from '../dtos/catalogo';
import { API_URL } from '../environments/develop';
import { Servicio } from '../dtos/servicio';

@Injectable({
  providedIn: 'root',
})
export class CategoriasService
{

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
    private httpClient: HttpClient,
  ) {}

  fetchCatalogos(page?: number): Observable<Catalogo>
  {
    const url = page ? `${API_URL}/catalogos?page=${page}`: `${API_URL}/catalogos`;
    return this.httpClient.get<Catalogo>(url, {
      headers: new HttpHeaders({
        Authorization: `${this.authService.session?.acess_token}`,
      }),
    })
      .pipe(
        this.toast.observe({
          loading: 'Obteniendo categorías',
          success: () => 'Categorías obtenidas',
          error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
        }),
        map( response => response as Catalogo),
      );
  }

  fetchCatalogoById(id: number): Observable<Categoria>
  {
    const url = `${API_URL}/catalogos/${id}`;
    return this.httpClient.get<Categoria>(url, {
      headers: new HttpHeaders({
        Authorization: `${this.authService.session?.acess_token}`,
      }),
    })
      .pipe(
        this.toast.observe({
          loading: 'Obteniendo categoría',
          success: () => 'Categoría obtenidas',
          error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
        }),
        map( response => response as Categoria),
      );
  }

  actualizarCatalogoPorId(id: number, categoria: Partial<Categoria>): Observable<Categoria>
  {
    return this.httpClient.put<Categoria>(`${API_URL}/catalogos/${id}`, {
      name: categoria.name,
    }, {
      headers: new HttpHeaders({
        Authorization: `${this.authService.session?.acess_token}`,
      }),
    }).pipe(
      this.toast.observe({
        loading: 'Actualizando categoría',
        success: () => 'Categoría actualizado',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
      map( response => response as Categoria),
    );
  }

  deleteCatalogo(id: number): Observable<void>
  {
    return this.httpClient.delete<void>(`${API_URL}/catalogos/${id}`).pipe(
      this.toast.observe({
        loading: 'Eliminando categoría...',
        success: () => 'Categoría eliminada',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
    );
  }

  crearCategoria(name: string): Observable<Categoria>
  {
    return this.httpClient.post(`${API_URL}/catalogos`, {
      name,
    }, {
      headers: new HttpHeaders({
        Authorization: `${this.authService.session?.acess_token}`,
      }),
    }).pipe(
      this.toast.observe({
        loading: 'Publicando categoría...',
        success: () => 'Categoría publicada',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map( (response:any) => response.data as Categoria),
    );
  }

  fetchServiciosByCatalogoId(id:number, page?:number)
  {
    const url = page ? `${API_URL}/catalogos/${id}?page=${page}`: `${API_URL}/catalogos/${id}`;

    return this.httpClient.get<unknown>(url, {
      headers: new HttpHeaders({
        Authorization: `${this.authService.session?.acess_token}`,
      }),
    })
      .pipe(
        this.toast.observe({
          loading: 'Obteniendo servicios',
          success: () => 'Servicios obtenidas',
          error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
        }),
        map( response => response),
      );
  }

  crearServicio(servicio: Servicio): Observable<Servicio>
  {
    return this.httpClient.post(`${API_URL}/servicios`, {
      catalogo_id: servicio.catalogo_id,
      clave_servicio: servicio.clave_servicio,
      nombre_servicio: servicio.nombre_servicio,
      importe: servicio.importe,
      cantidad_minima: servicio.cantidad_minima,
    }, {
      headers: new HttpHeaders({
        Authorization: `${this.authService.session?.acess_token}`,
      }),
    }).pipe(
      this.toast.observe({
        loading: 'Publicando servicio...',
        success: () => 'Servicio publicado',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map( (response:any) => response.data as Servicio),
    );
  }

  fetchServicioById(id:number): Observable<Servicio>
  {
    return this.httpClient.get<unknown>(`${API_URL}/servicios/${id}`, {
      headers: new HttpHeaders({
        Authorization: `${this.authService.session?.acess_token}`,
      }),
    })
      .pipe(
        this.toast.observe({
          loading: 'Obteniendo servicio',
          success: () => 'Servicio obtenido',
          error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
        }),
        map( response => response as Servicio),
      );
  }

  actualizarServicioPorId(id:number, servicio: Partial<Servicio>)
  {
    return this.httpClient.put(`${API_URL}/servicios/${id}`, {
      nombre_servicio: servicio.nombre_servicio,
      importe: servicio.importe,
      cantidad_minima: servicio.cantidad_minima,
      catalogo_id: servicio.catalogo_id,
    }, {
      headers: new HttpHeaders({
        Authorization: `${this.authService.session?.acess_token}`,
      }),
    }).pipe(
      this.toast.observe({
        loading: 'Actualizando servicio',
        success: () => 'Servicio actualizado',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
      map( response => response as Servicio),
    );
  }

  deleteServicio(id:number)
  {
    return this.httpClient.delete<void>(`${API_URL}/servicios/${id}`).pipe(
      this.toast.observe({
        loading: 'Eliminando servicio...',
        success: () => 'Servicio eliminada',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
    );
  }
}
