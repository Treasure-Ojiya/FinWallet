import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Authentication } from '../../../core/service/auth-service/authentication';
import { LoginModel, RegModel, RegResponse } from '../../../model/app.model';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css',
})
export class AuthPage {
  private authentication = inject(Authentication);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isVerified = false;
  loader = false;

  loginForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    email: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    password: ['', Validators.required],
  });

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginData = this.loginForm.value as LoginModel;

    this.authentication.login(loginData).subscribe({
      next: (res) => {
        if (res.isVerified) {
          console.log('Login successful, token:', res.accessToken);
          console.log('User is verified:', res.isVerified);
          console.log('Navigating to overview page...');
          this.router.navigate(['/auth/overview']);
        } else {
          this.router.navigate(['/auth/resend-otp']);
        }
      },
      error: () => {
        alert('Login failed. Please check your credentials.');
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const regData = this.registerForm.value as RegModel;

    this.authentication.register(regData).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.router.navigate(['/auth/verify-account'], {
            state: { email: regData.email },
          });
        }
      },
      error: () => {
        alert('Registration failed. Please try again.');
      },
    });
  }
}
