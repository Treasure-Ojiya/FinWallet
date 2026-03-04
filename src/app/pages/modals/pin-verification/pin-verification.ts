import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pin-verification',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pin-verification.html',
  styleUrl: './pin-verification.css',
})
export class PinVerification {
  @Output() pinConfirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  pinForm: FormGroup;
  isLoading = false;

  constructor() {
    this.pinForm = this.fb.group({
      pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    });
  }

  onSubmit(): void {
    if (this.pinForm.invalid) return;

    this.isLoading = true;

    // Simulate a short delay for UX
    setTimeout(() => {
      this.pinConfirmed.emit(this.pinForm.get('pin')?.value);
      this.isLoading = false;
    }, 500);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
