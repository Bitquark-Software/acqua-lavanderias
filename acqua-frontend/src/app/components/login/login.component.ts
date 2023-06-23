/* eslint-disable no-unused-vars */
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthDto } from 'src/app/dtos/auth-dto';
import { AuthService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent
{
  loginForm = this.fb.group({
    email: ['', [
      Validators.required,
      Validators.email,
    ]],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  )
  {
    this.hasSession();
  }

  async hasSession()
  {
    setTimeout(() =>
    {
      if(this.authService.session)
      {
        this.router.navigate(['/dashboard']);
      }
    }, 500);
  }

  async login()
  {
    this.authService.login(this.email.value ?? '', this.password.value ?? '')
      .subscribe({
        next: () =>
        {
          this.router.navigate(['/dashboard']);
        },
        error: (error) =>
        {
          console.log(error);
        },
      });
  }

  get email()
  {
    return this.loginForm.controls['email'];
  }
  get password()
  {
    return this.loginForm.controls['password'];
  }
}
