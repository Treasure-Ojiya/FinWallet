import { Component, inject } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  Validators,
  FormBuilder,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Authentication } from '../../../core/service/auth-service/authentication';
import { RegModel } from '../../../model/app.model';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authentication = inject(Authentication);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isVerified = false;
  loader = false;

  // Custom validator for password strength
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isValidLength = password.length >= 8;

    const passwordValid =
      hasUpperCase && hasLowerCase && hasNumeric && hasSpecial && isValidLength;

    return !passwordValid ? { passwordStrength: true } : null;
  }

  // Custom validator for password matching
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  registerForm = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{11}$/)],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.passwordStrengthValidator.bind(this),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );

  // ========== GETTERS SECTION ==========
  // Helper getter for password mismatch
  get passwordMismatch() {
    return (
      this.registerForm.hasError('passwordMismatch') &&
      this.registerForm.get('confirmPassword')?.touched
    );
  }

  // Get password value for real-time validation
  get password() {
    return this.registerForm.get('password')?.value || '';
  }

  // Password requirement getters
  get hasUpperCase() {
    return /[A-Z]/.test(this.password);
  }

  get hasLowerCase() {
    return /[a-z]/.test(this.password);
  }

  get hasNumeric() {
    return /[0-9]/.test(this.password);
  }

  get hasSpecial() {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password);
  }

  get hasMinLength() {
    return this.password.length >= 8;
  }

  // Get formatted password errors for display
  get passwordErrors() {
    const password = this.registerForm.get('password');
    if (!password?.errors || !password.touched) return [];

    const errors = [];
    if (password.errors?.['required']) errors.push('Password is required');
    if (password.errors?.['minlength'])
      errors.push('Password must be at least 8 characters');
    if (password.errors?.['passwordStrength']) {
      errors.push(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    }
    return errors;
  }
  // ========== END GETTERS SECTION ==========

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loader = true;

    // Log the form value to see what's being sent
    console.log('Form valid:', this.registerForm.valid);
    console.log('Form errors:', this.registerForm.errors);
    console.log('Password errors:', this.registerForm.get('password')?.errors);

    const regData = this.registerForm.value as RegModel;
    console.log('Registration payload:', regData);

    this.authentication.register(regData).subscribe({
      next: (res) => {
        this.loader = false;
        console.log('Registration response:', res);

        if (res.status === 'success') {
          this.router.navigate(['/auth/verify-account'], {
            queryParams: { email: regData.email },
          });
        }
      },
      error: (error) => {
        this.loader = false;
        console.error('Registration error:', error);

        // Better error handling
        let message = 'Registration failed. Please try again.';
        if (error.error?.errors) {
          const backendErrors = error.error.errors;
          message = Object.values(backendErrors).join('\n');
        } else if (error.error?.msg) {
          message = error.error.msg;
        } else if (error.error?.message) {
          message = error.error.message;
        }

        alert(message);
      },
    });
  }
}
