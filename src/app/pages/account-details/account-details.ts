import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../core/service/user/user-service';
import { TransferService } from '../../core/service/transfer/transfer-service';
import { Router } from '@angular/router';
import { PinChange } from '../modals/pin-change/pin-change';
import { PinSetup } from '../modals/pin-setup/pin-setup';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-account-details',
  imports: [CommonModule, PinSetup, PinChange],
  templateUrl: './account-details.html',
  styleUrl: './account-details.css',
})
export class AccountDetails implements OnInit {
  private userService = inject(UserService);
  private transferService = inject(TransferService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  firstName = '';
  lastName = '';
  emailVerified = false;
  phoneNumber = '';
  accountLevel = '';
  createdAt = '';
  isVerified = false;

  bankName = '';
  accountName = '';
  email = '';
  accountNumber = '';

  showPinSetupModal = false;
  showPinChangeModal = false;
  hasPin = false;

  totalTransactions: number = 0;

  ngOnInit(): void {
    this.userDetails();
    this.getBankDetails();
    this.checkPinStatus();

    this.transferService.transactions$.subscribe((transactions) => {
      if (transactions && transactions.length > 0) {
        this.totalTransactions = transactions.length;
      } else {
        this.totalTransactions = 0;
      }
    });

    this.transferService.fetchTransactions().subscribe();
  }

  userDetails() {
    this.userService.getUserDetail().subscribe({
      next: (res) => {
        this.firstName = res.data.firstName;
        this.lastName = res.data.lastName;
        this.email = res.data.email;
        this.emailVerified = res.data.emailVerified;
        this.phoneNumber = res.data.phoneNumber;
        this.accountLevel = res.data.accountLevel;
        this.createdAt = res.data.createdAt;
        this.isVerified = res.data.emailVerified;
      },
    });
  }

  // In your component
  get displayYear(): string {
    if (!this.createdAt) return '';

    try {
      const date = new Date(this.createdAt);
      // Check if it's a valid date
      if (!isNaN(date.getTime())) {
        return date.getFullYear().toString();
      }
      return '';
    } catch {
      return '';
    }
  }

  createInitials(): string {
    const firstInitial = this.firstName
      ? this.firstName.charAt(0).toUpperCase()
      : '';
    const lastInitial = this.lastName
      ? this.lastName.charAt(0).toUpperCase()
      : '';
    return firstInitial + lastInitial;
  }

  // In your component
  // getFormattedDate() {
  //   if (this.createdAt?.toDate) {
  //     return this.createdAt.toDate();
  //   }
  //   return this.createdAt;
  // }

  getBankDetails() {
    this.userService.myBankDetails().subscribe({
      next: (res) => {
        this.bankName = res.data.bankName;
        this.accountName = res.data.accountName;
        this.accountNumber = res.data.accountNumber;
      },
    });
  }

  checkPinStatus() {
    this.hasPin = this.userService.hasPin();
  }

  openPinSetupModal() {
    this.showPinSetupModal = true;
  }

  openPinChangeModal() {
    this.showPinChangeModal = true;
  }

  onPinSet() {
    this.hasPin = true;
    this.snackBar.open('PIN has been set successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  onPinChanged() {
    this.snackBar.open('PIN has been changed successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  closeModals() {
    this.showPinSetupModal = false;
    this.showPinChangeModal = false;
  }
}
