/* eslint-disable no-unused-vars */
import { Injectable } from '@angular/core';
import { AuthDto } from '../dtos/auth-dto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';
import { API_URL } from '../environments/develop';

@Injectable ({
  providedIn: 'root',
})
export class AuthService
{
  session!: AuthDto | null;

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

    if(!localSession) this.session = null;

    if(localSession)
    {
      this.session = JSON.parse(localSession) as AuthDto;
    }
  }

  login(email: string, password: string): Observable<AuthDto>
  {
    return this.httpClient.post<AuthDto>(`${API_URL}/login`, {
      email,
      password,
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
        return response as AuthDto;
      }),
    );
  }

  getHeaders()
  {
    return new HttpHeaders({
      Authorization: `Bearer ${this.session?.access_token}`,
      Accept: 'application/json',
    });
  }
}
