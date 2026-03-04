import { Component, inject } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Authentication } from '../../../core/service/auth-service/authentication';
import { LoginModel } from '../../../model/app.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authentication = inject(Authentication);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isVerified = false;
  loader = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onLogin(): void {
    localStorage.removeItem('token');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.value.email?.trim();
    const password = this.loginForm.value.password?.trim();

    if (!email || !password) {
      alert('Email and password are required');
      return;
    }

    const loginData: LoginModel = {
      email: email,
      password: password,
    };

    console.log('LOGIN PAYLOAD:', loginData);

    this.authentication.login(loginData).subscribe({
      next: (res) => {
        if (res.isVerified) {
          this.router.navigate(['/overview']);
        } else {
          this.router.navigate(['/auth/verify-account']);
        }
      },
      // In login.ts, modify the error handling to see more details
      error: (error) => {
        console.error('Full error object:', error); // Add this

        if (error.error && error.error.msg) {
          alert(`Login failed: ${error.error.msg}`);

          // If the error is about verification
          if (
            error.error.msg.includes('verify') ||
            error.error.msg.includes('verified')
          ) {
            // Navigate to verify page with email
            this.router.navigate(['/auth/verify-account'], {
              state: { email: this.loginForm.value.email },
            });
          }
        } else {
          alert('Login failed. Please check your credentials.');
        }
      },
    });
  }
}
