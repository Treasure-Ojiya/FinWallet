import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/service/user/user-service';
import { SetPinRequest } from '../../../model/app.model';

@Component({
  selector: 'app-pin-setup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pin-setup.html',
  styleUrl: './pin-setup.css',
})
export class PinSetup {
  @Output() pinSet = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  pinForm: FormGroup;
  isLoading = false;

  constructor() {
    this.pinForm = this.fb.group(
      {
        pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
        confirmPin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      },
      { validators: this.pinMatchValidator },
    );
  }

  private pinMatchValidator(
    group: FormGroup,
  ): { [key: string]: boolean } | null {
    const pin = group.get('pin')?.value;
    const confirmPin = group.get('confirmPin')?.value;
    return pin === confirmPin ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.pinForm.invalid) return;

    this.isLoading = true;

    const pinData: SetPinRequest = {
      pin: this.pinForm.get('pin')?.value,
    };

    this.userService.setTransactionPin(pinData).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.snackBar.open(
          response.msg || 'PIN set up successfully!',
          'Close',
          {
            duration: 3000,
            panelClass: ['success-snackbar'],
          },
        );

        this.pinSet.emit();
        this.onClose();
      },
      error: (error) => {
        this.isLoading = false;

        const errorMessage =
          error.error?.msg || 'Failed to set up PIN. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}
