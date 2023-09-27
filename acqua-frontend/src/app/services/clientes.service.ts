/* eslint-disable no-unused-vars */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthService } from './auth-service.service';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { Cliente, ClienteResponse } from '../dtos/cliente';
import { API_URL } from '../environments/develop';
import { Ubicacion } from '../dtos/ubicacion';

@Injectable({
  providedIn: 'root',
})
export class ClientesService
{
  private cancelRequest$: Subject<void> = new Subject<void>();

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
    private httpClient: HttpClient,
  )
  {
    //
  }

  fetchClienteById(id:number): Observable<Cliente>
  {
    return this.httpClient.get<Cliente>(`${API_URL}/clientes/${id}`, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Obteniendo datos del cliente...',
        success: () => 'Cliente encontrado',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
      map( response => response as Cliente),
    );
  }

  actualizarCliente(id: number, cliente: Partial<Cliente>)
  {
    return this.httpClient.put(
      `${API_URL}/clientes/${id}`,
      {
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
      },
      {
        headers: this.authService.getHeaders(),
      },
    ).pipe(
      this.toast.observe({
        loading: 'Actualizando cliente...',
        success: () => 'Cliente actualizado',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
      map(response => response as Cliente),
    );
  }

  eliminarCliente(id: number)
  {
    return this.httpClient.delete(`${API_URL}/clientes/${id}`, {
      headers: this.authService.getHeaders(),
    })
      .pipe(
        this.toast.observe({
          loading: 'Eliminando cliente...',
          success: () => 'Cliente eliminado',
          error: (e) => `Error: ${e.error.mensaje ?? 'Desconocido'}`,
        }),

      );
  }

  fetchClientes(page?: number): Observable<ClienteResponse>
  {
    const url = page ? `${API_URL}/clientes?page=${page}` : `${API_URL}/clientes`;
    return this.httpClient.get<ClienteResponse>(url, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Obteniendo clientes...',
        success: () => 'Clientes encontrados',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
    );
  }

  buscarClientePorNombre(nombre: string): Observable<Cliente[]>
  {
    const request = this.httpClient.post<Cliente[]>(`${API_URL}/clientes/nombre`, {
      nombre,
    }, {
      headers: this.authService.getHeaders(),
      observe: 'response',
    }).pipe(
      takeUntil(this.cancelRequest$),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((response: HttpResponse<any>) => response.body.clientes as Cliente[]),
    );

    return new Observable<Cliente[]>(observer =>
    {
      request.subscribe(
        (clientes: Cliente[]) =>
        {
          observer.next(clientes);
          observer.complete();
        },
        error => observer.error(error),
      );

      return () =>
      {
        this.cancelRequest$.next(); // Emite una señal de cancelación al observable
      };
    });
  }

  buscarClientePorTelefono(telefono: string): Observable<Cliente[]>
  {
    const request = this.httpClient.post<Cliente[]>(`${API_URL}/clientes/telefono`, {
      telefono,
    }, {
      headers: this.authService.getHeaders(),
      observe: 'response',
    }).pipe(
      takeUntil(this.cancelRequest$),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((response: HttpResponse<any>) => response.body.clientes as Cliente[]),
    );

    return new Observable<Cliente[]>(observer =>
    {
      request.subscribe(
        (clientes: Cliente[]) =>
        {
          observer.next(clientes);
          observer.complete();
        },
        error => observer.error(error),
      );

      return () =>
      {
        this.cancelRequest$.next(); // Emite una señal de cancelación al observable
      };
    });
  }

  registrarCliente(cliente: Partial<Cliente>)
  {
    return this.httpClient.post<Cliente>(`${API_URL}/clientes`,
      {
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
      }, {
        headers: this.authService.getHeaders(),
      }).pipe(
      this.toast.observe({
        loading: 'Registrando datos del cliente...',
        success: () => 'Cliente registrado',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
    ).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (response: any) =>
      {
        const clienteResponseItem = response.data as Cliente;
        if((cliente.direccion?.length ?? 0) > 0)
        {
          this.httpClient.post(`${API_URL}/direcciones`, {
            calle: cliente.direccion ? cliente.direccion[0].calle : '',
            numero: cliente.direccion ? cliente.direccion[0].numero.toString() : '0',
            colonia: cliente.direccion ? cliente.direccion[0].colonia : '',
            ciudad: cliente.direccion ? cliente.direccion[0].ciudad : '',
            codigo_postal: cliente.direccion ? cliente.direccion[0].codigo_postal.toString() : '0',
            nombre_ubicacion: cliente.direccion ? cliente.direccion[0].nombre_ubicacion : 0,
            cliente_id: clienteResponseItem.id,
          }, { headers: this.authService.getHeaders() }).pipe(
            this.toast.observe({
              loading: 'Registrando dirección del cliente...',
              success: () => 'Dirección registrada',
              error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
            }),
          ).subscribe(
            {
              next: () =>
              {
                //
              },
              error: (err) =>
              {
                console.log(err);
              },
            },
          );
        }
      },
    });
  }

  registrarUbicacion(ubicacion: Partial<Ubicacion>, cliente_id: number)
  {
    return this.httpClient.post<Ubicacion>(`${API_URL}/direcciones`, {
      calle: ubicacion.calle,
      numero: ubicacion.numero,
      colonia: ubicacion.colonia,
      ciudad: ubicacion.ciudad,
      codigo_postal: ubicacion.codigo_postal,
      nombre_ubicacion: ubicacion.nombre_ubicacion,
      cliente_id,
    }, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Registrando dirección del cliente...',
        success: () => 'Dirección registrada',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
    );
  }

  eliminarDireccion(id: number)
  {
    return this.httpClient.delete(`${API_URL}/direcciones/${id}`, {
      headers: this.authService.getHeaders(),
    }).pipe(
      this.toast.observe({
        loading: 'Eliminado dirección...',
        success: () => 'Dirección eliminada',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
    );
  }
}
