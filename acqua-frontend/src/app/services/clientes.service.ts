/* eslint-disable no-unused-vars */
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthService } from './auth-service.service';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { Cliente, ClienteResponse } from '../dtos/cliente';
import { API_URL } from '../environments/develop';

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

  fetchClientes(page?: number): Observable<ClienteResponse>
  {
    const url = page ? `${API_URL}/clientes?page=${page}` : `${API_URL}/clientes`;
    return this.httpClient.get<ClienteResponse>(url).pipe(
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
      headers: new HttpHeaders({
        Authorization: `${this.authService.session}`,
      }),
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
        headers: new HttpHeaders({
          Authorization: `${this.authService.session?.acess_token}`,
        }),
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
        if((cliente.ubicaciones?.length ?? 0) > 0)
        {
          this.httpClient.post(`${API_URL}/direcciones`, {
            calle: cliente.ubicaciones ? cliente.ubicaciones[0].direccion : '',
            numero: cliente.ubicaciones ? cliente.ubicaciones[0].numero.toString() : '0',
            colonia: cliente.ubicaciones ? cliente.ubicaciones[0].colonia : '',
            ciudad: cliente.ubicaciones ? cliente.ubicaciones[0].ciudad : '',
            codigo_postal: cliente.ubicaciones ? cliente.ubicaciones[0].codigoPostal.toString() : '0',
            nombre_ubicacion: cliente.ubicaciones ? cliente.ubicaciones[0].nombre : 0,
            cliente_id: clienteResponseItem.id,
          }).pipe(
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
}
