import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [
      Validators.required,
      Validators.email,
    ]],
    password: ['', Validators.required],
  });

  // eslint-disable-next-line no-unused-vars
  constructor(private fb: FormBuilder) {
    //
  }

  async login() {
    // TBD
  }

  get email() {
    return this.loginForm.controls['email'];
  }
}
