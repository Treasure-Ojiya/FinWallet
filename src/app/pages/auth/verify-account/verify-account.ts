import { Component, inject, OnInit } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { Authentication } from '../../../core/service/auth-service/authentication';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-account',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-account.html',
  styleUrl: './verify-account.css',
})
export class VerifyAccount implements OnInit {
  private authentication = inject(Authentication);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  email: string | null = null;
  loader = false;

  // Initialize form without email first
  verifyForm = this.fb.group({
    email: ['', Validators.required],
    otp: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit() {
    // Try to get email from navigation state or query params
    const navigation = this.router.currentNavigation();
    this.email =
      navigation?.extras?.state?.['email'] ||
      history.state.email ||
      this.getQueryParam('email');

    if (!this.email) {
      alert('Please login or register first');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Set the email in the form after we have it
    this.verifyForm.patchValue({
      email: this.email,
    });

    // Optional: Disable email field so user can't change it
    this.verifyForm.get('email')?.disable();
  }

  // Helper method to get query params if you're using them
  private getQueryParam(param: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  onVerify(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.loader = true;

    // FIX: Get email from the class property (already validated in ngOnInit)
    // or from the form value with a non-null assertion
    const emailValue = this.email; // Use the class property

    // Double-check that email is not null
    if (!emailValue) {
      alert('Email is missing. Please try registering again.');
      this.router.navigate(['/auth/register']);
      return;
    }

    // Now TypeScript knows emailValue is string (not null)
    const payload = {
      email: emailValue,
      otp: this.verifyForm.getRawValue().otp as string,
    };

    console.log('Verifying with payload:', payload);

    this.authentication.verifyAccount(payload).subscribe({
      next: () => {
        this.router.navigate(['/overview']);
      },
      error: (error) => {
        console.error('Verification error:', error);
        const message = error.error?.msg || 'Invalid or expired OTP';
        alert(message);
      },
    });
  }

  // Alternative approach using form value with type assertion
  onVerifyAlternative(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    // Get the raw form value (includes disabled fields)
    const formValue = this.verifyForm.getRawValue();

    // Type assertion to tell TypeScript these values are strings
    const payload = {
      email: formValue.email as string,
      otp: formValue.otp as string,
    };

    // Validate that email is not empty
    if (!payload.email) {
      alert('Email is missing. Please try registering again.');
      this.router.navigate(['/auth/register']);
      return;
    }

    console.log('Verifying with payload:', payload);

    this.authentication.verifyAccount(payload).subscribe({
      next: () => {
        this.router.navigate(['/overview']);
      },
      error: (error) => {
        console.error('Verification error:', error);
        const message = error.error?.msg || 'Invalid or expired OTP';
        alert(message);
      },
    });
  }

  onResend(): void {
    if (!this.email) {
      alert('Email is missing. Please try registering again.');
      this.router.navigate(['/auth/register']);
      return;
    }
  }
}
