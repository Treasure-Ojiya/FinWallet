import { Component, inject } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { Authentication } from '../../../core/service/auth-service/authentication';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-resend-otp',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './resend-otp.html',
  styleUrl: './resend-otp.css',
})
export class ResendOTP {
  private authentication = inject(Authentication);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loader = false;

  otpForm = this.fb.group({
    email: ['', Validators.required],
  });

  onResendOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.loader = true;

    const email = this.otpForm.value.email as string;
    this.authentication.resendOtp(email).subscribe({
      next: () => {
        this.router.navigate(['/auth/verify-account'], { state: { email } });
      },
      error: () => {
        alert('Failed to resend OTP');
      },
    });
  }
}
