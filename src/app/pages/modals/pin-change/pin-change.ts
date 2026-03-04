import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/service/user/user-service';
import { ChangePinRequest } from '../../../model/app.model';

@Component({
  selector: 'app-pin-change',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pin-change.html',
  styleUrl: './pin-change.css',
})
export class PinChange {
  @Output() pinChanged = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  pinForm: FormGroup;
  isLoading = false;

  constructor() {
    this.pinForm = this.fb.group(
      {
        oldPin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
        newPin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
        confirmPin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      },
      { validators: this.pinMatchValidator },
    );
  }

  private pinMatchValidator(
    group: FormGroup,
  ): { [key: string]: boolean } | null {
    const newPin = group.get('newPin')?.value;
    const confirmPin = group.get('confirmPin')?.value;
    return newPin === confirmPin ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.pinForm.invalid) return;

    this.isLoading = true;

    const pinData: ChangePinRequest = {
      oldPin: this.pinForm.get('oldPin')?.value,
      newPin: this.pinForm.get('newPin')?.value,
    };

    this.userService.changeTransactionPin(pinData).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.snackBar.open(
          response.msg || 'PIN changed successfully!',
          'Close',
          {
            duration: 3000,
            panelClass: ['success-snackbar'],
          },
        );

        this.pinChanged.emit();
        this.onClose();
      },
      error: (error) => {
        this.isLoading = false;

        const errorMessage =
          error.error?.msg || 'Failed to change PIN. Please try again.';
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
