/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthDto } from '../dtos/auth-dto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';
import { API_URL } from '../environments/develop';
import { Usuario, UsuarioResponse } from '../dtos/usuario';
import { Role } from '../enums/Role.enum';

@Injectable ({
  providedIn: 'root',
})

export class AuthService
{
  session!: AuthDto | null;
  userRole: Role | null = null;
  isLoggedIn = false;

  constructor(
    private httpClient: HttpClient,
    private toast: HotToastService,
  )
  {
    this.fetchLocalSession();
  }

  private fetchLocalSession()
  {
    const localSession = localStorage.getItem('session');

    if(localSession)
    {
      this.session = JSON.parse(localSession) as AuthDto;
      this.userRole = this.session.datos.role;
      this.isLoggedIn = true;
    }
    else
    {
      this.session = null;
      this.userRole = null;
      this.isLoggedIn = false;
    }
  }

  login(email: string, password: string): Observable<AuthDto>
  {
    return this.httpClient.post<AuthDto>(`${API_URL}/login`, {
      email,
      password,
    }, {
      headers: this.getLoginToken(),
    }).pipe(
      this.toast.observe({
        loading: 'Iniciando sesión',
        success: () => '¡Bienvenido!',
        error: (e) => `Error: ${e.error.error ?? 'Desconocido'}`,
      }),
      map(response =>
      {
        this.session = response;
        localStorage.setItem('session', JSON.stringify(response));
        this.userRole = this.session.datos.role;
        this.isLoggedIn = true;
        return response as AuthDto;
      }),
    );
  }

  private getLoginToken()
  {
    return new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
    });
  }

  getHeaders()
  {
    return new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      Authorization: `Bearer ${this.session?.access_token}`,
      Accept: 'application/json',
    });
  }

  getFileHeaders()
  {
    return new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      Authorization: `Bearer ${this.session?.access_token}`,
      Accept: 'application/pdf',
    });
  }

  getPerfil(id: number)
  {
    return this.httpClient.get(
      `${API_URL}/admin/dashboard/${id}`,
      { headers: this.getHeaders() });
  }

  getEmpleados(page?: number)
  {
    const url = page ? `${API_URL}/admin/dashboard?page=${page}` : `${API_URL}/admin/dashboard`;
    return this.httpClient.get<UsuarioResponse>
    (url, { headers: this.getHeaders() });
  }

  registrarEmpleado(usuario: Usuario, password: string)
  {
    return this.httpClient.post(
      `${API_URL}/admin/dashboard`, {
        name: usuario.nombre,
        email: usuario.email,
        role: usuario.role,
        password,
      }, { headers: this.getHeaders() });
  }

  actualizarEmpleado(id: number, name: string, email: string, role: Role)
  {
    return this.httpClient.put(
      `${API_URL}/admin/dashboard/${id}`, {
        name,
        email,
        role,
      }, { headers: this.getHeaders() });
  }

  deleteEmpleado(id: number)
  {
    return this.httpClient.delete(
      `${API_URL}/admin/dashboard/${id}`,
      { headers: this.getHeaders() });
  }

  logout()
  {
    return this.httpClient.post(
      `${API_URL}/logout`,
      { headers: this.getHeaders() }).subscribe({
      next: () =>
      {
        localStorage.clear();
        this.session = null;
        this.userRole = null;
        this.isLoggedIn = false;
      },
      error: (err) => this.toast.error(`${err.error.message ?? 'Desconocido'}`),
    });
  }

  getUserRole(): Role | null
  {
    return this.userRole;
  }

  hasRole(role: Role): boolean
  {
    return this.isLoggedIn && this.userRole === role;
  }

}
