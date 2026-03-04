import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from '../../core/service/user/user-service';
import { TransferService } from '../../core/service/transfer/transfer-service';
import {
  Bank,
  GetBankResponse,
  ResolveAccountResponse,
  TransferRequest,
  UserResponse,
} from '../../model/app.model';
import { ClickOutside } from '../../shared/directives/click-outside';
import { PinVerification } from '../modals/pin-verification/pin-verification';

@Component({
  selector: 'app-transfer',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSlideToggleModule,
    ClickOutside,
    PinVerification,
  ],
  templateUrl: './transfer.html',
  styleUrl: './transfer.css',
})
export class Transfer implements OnInit {
  private userService = inject(UserService);
  private transferService = inject(TransferService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  banks: Bank[] = [];
  filteredBanks: Bank[] = [];

  bankOpen = false;
  bankQuery = '';
  selectedBank: Bank | null = null;
  selectedBankCode = '';
  resolvedAccountName = '';
  isLoading = false;

  // Add this to store the user's ID
  userId: string = '';

  searchForm!: FormGroup;
  accountForm!: FormGroup;

  beneficiaries: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
  }[] = [];

  showPinModal = false;
  pendingTransferData: any = null;

  ngOnInit(): void {
    this.initForms();
    this.fetchBanks();
    this.loadBeneficiaries();
    this.watchAccountNumber();
    this.loadUserDetails(); // Add this to load user details
  }

  /* ===========================
     👤 USER DETAILS
     =========================== */

  private loadUserDetails() {
    this.userService.getUserDetail().subscribe({
      next: (res: UserResponse) => {
        this.userId = res.data._id;
        console.log('User ID loaded:', this.userId);
      },
      error: (error) => {
        console.error('Failed to load user details:', error);
        this.snackBar.open('Failed to load user details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  /* ===========================
     🧱 FORMS
     =========================== */

  private initForms() {
    this.searchForm = this.fb.group({
      query: [''],
    });

    this.accountForm = this.fb.group({
      accountNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      amount: [
        '',
        [Validators.required, Validators.min(100), Validators.pattern(/^\d+$/)],
      ],
      narration: ['', [Validators.required, Validators.maxLength(100)]],
      saveAsBeneficiary: [false],
    });
  }

  private watchAccountNumber() {
    this.accountForm.get('accountNumber')?.valueChanges.subscribe((value) => {
      if (value?.length === 10 && this.selectedBankCode) {
        this.resolveAccount();
      } else {
        this.resolvedAccountName = '';
      }
    });
  }

  /* ===========================
     🔍 SEARCHABLE BANK
     =========================== */

  onBankSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.bankQuery = value;
    this.bankOpen = true;

    this.filteredBanks = this.banks.filter((bank) =>
      bank.name.toLowerCase().includes(value),
    );
  }

  selectBank(bank: Bank) {
    this.selectedBank = bank;
    this.selectedBankCode = bank.code;
    this.bankQuery = bank.name;
    this.bankOpen = false;

    if (this.accountForm.get('accountNumber')?.value?.length === 10) {
      this.resolveAccount();
    }
  }

  closeBankDropdown() {
    this.bankOpen = false;
  }

  /* ===========================
     🔁 ACCOUNT RESOLUTION
     =========================== */

  resolveAccount() {
    const { accountNumber } = this.accountForm.value;

    if (!accountNumber || !this.selectedBankCode) {
      console.log('Missing required fields:', {
        accountNumber,
        selectedBankCode: this.selectedBankCode,
      });
      return;
    }

    console.log('Resolving account with:', {
      accountNumber,
      bankCode: this.selectedBankCode,
      bankName: this.selectedBank?.name,
    });

    this.userService
      .resolveAccountDetails(accountNumber, this.selectedBankCode)
      .subscribe({
        next: (res: ResolveAccountResponse) => {
          console.log('Resolve success:', res);
          this.resolvedAccountName = res.data.account_name;
          this.snackBar.open(`Account: ${res.data.account_name}`, 'Close', {
            duration: 5000,
          });
        },
        error: (error) => {
          console.error('Resolve account error:', error);

          if (error.error) {
            console.error('Error response body:', error.error);
          }

          this.resolvedAccountName = '';

          let errorMessage = 'Invalid account details';
          if (error.error?.msg) {
            errorMessage = error.error.msg;
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  /* ===========================
     💸 MAKE TRANSFER
     =========================== */

  makeTransfer() {
    if (
      this.accountForm.invalid ||
      !this.selectedBank ||
      !this.resolvedAccountName
    ) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    // Check if user has PIN set
    if (!this.userService.hasPin()) {
      this.snackBar.open(
        'Please set up your transaction PIN first in Account Details',
        'Close',
        {
          duration: 5000,
        },
      );
      this.router.navigate(['/account-details']);
      return;
    }

    // Check if user ID is loaded
    if (!this.userId) {
      this.snackBar.open(
        'User details not loaded. Please try again.',
        'Close',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        },
      );
      return;
    }

    // Store transfer data and show PIN modal
    this.pendingTransferData = {
      amount: Number(this.accountForm.value.amount),
      bankName: this.selectedBank.name,
      accountNumber: this.accountForm.value.accountNumber,
      accountName: this.resolvedAccountName,
      bankCode: this.selectedBankCode,
      narration: this.accountForm.value.narration,
      saveAsBeneficiary: this.accountForm.value.saveAsBeneficiary,
    };

    this.showPinModal = true;
  }

  /* ===========================
     🔐 PIN CONFIRMATION
     =========================== */

  onPinConfirmed(pin: string) {
    this.showPinModal = false;

    if (!this.pendingTransferData) return;

    // Use the user's _id as the categoryId
    const transferRequest: TransferRequest = {
      amount: this.pendingTransferData.amount,
      bankName: this.pendingTransferData.bankName,
      accountNumber: this.pendingTransferData.accountNumber,
      accountName: this.pendingTransferData.accountName,
      bankCode: this.pendingTransferData.bankCode,
      narration: this.pendingTransferData.narration,
      pin: pin,
      categoryId: this.userId, // Use the actual user ID from user details
      // saveAsBeneficiary is NOT sent to backend - handled client-side
    };

    console.log('Transfer request with categoryId:', transferRequest);
    this.executeTransfer(transferRequest);
  }

  /* ===========================
     🚀 EXECUTE TRANSFER
     =========================== */

  private executeTransfer(transferRequest: TransferRequest) {
    if (this.isLoading) return;

    this.isLoading = true;

    // Log the request to verify structure
    console.log('Transfer Request:', transferRequest);

    this.transferService.createTransfer(transferRequest).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.snackBar.open(
          `Transfer successful! Reference: ${response.data.reference}`,
          'Close',
          {
            duration: 5000,
            panelClass: ['success-snackbar'],
          },
        );

        // Save as beneficiary if toggle is on (client-side only)
        if (this.pendingTransferData?.saveAsBeneficiary) {
          this.saveBeneficiary({
            accountNumber: this.pendingTransferData.accountNumber,
            accountName: this.pendingTransferData.accountName,
            bankName: this.pendingTransferData.bankName,
            bankCode: this.pendingTransferData.bankCode,
          });
        }

        // Reset form
        this.resetForm();
      },
      error: (error) => {
        this.isLoading = false;

        let errorMessage = 'Transfer failed. Please try again.';
        if (error.error?.msg) {
          errorMessage = error.error.msg;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });

        this.pendingTransferData = null;
      },
    });
  }

  /* ===========================
     🔄 RESET FORM
     =========================== */

  private resetForm() {
    this.accountForm.reset({
      accountNumber: '',
      amount: '',
      narration: '',
      saveAsBeneficiary: false,
    });
    this.selectedBank = null;
    this.bankQuery = '';
    this.resolvedAccountName = '';
    this.pendingTransferData = null;
  }

  /* ===========================
     👥 BENEFICIARY MANAGEMENT
     =========================== */

  private loadBeneficiaries() {
    const saved = localStorage.getItem('beneficiaries');
    if (saved) {
      try {
        this.beneficiaries = JSON.parse(saved);
      } catch (e) {
        this.beneficiaries = [];
      }
    }
  }

  private saveBeneficiary(beneficiary: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
  }) {
    const exists = this.beneficiaries.some(
      (b) =>
        b.accountNumber === beneficiary.accountNumber &&
        b.bankCode === beneficiary.bankCode,
    );

    if (!exists) {
      this.beneficiaries.push(beneficiary);
      localStorage.setItem('beneficiaries', JSON.stringify(this.beneficiaries));

      this.snackBar.open('Beneficiary saved successfully', 'Close', {
        duration: 2000,
      });
    }
  }

  selectBeneficiary(beneficiary: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
  }) {
    const bank = this.banks.find((b) => b.code === beneficiary.bankCode);
    if (bank) {
      this.selectedBank = bank;
      this.selectedBankCode = bank.code;
      this.bankQuery = bank.name;
      this.resolvedAccountName = beneficiary.accountName;

      this.accountForm.patchValue({
        accountNumber: beneficiary.accountNumber,
      });
    }
  }

  /* ===========================
     🔎 BENEFICIARY SEARCH
     =========================== */

  onSearch() {
    const query = this.searchForm.value.query?.toLowerCase() || '';

    if (!query) {
      return;
    }

    this.beneficiaries = this.beneficiaries.filter(
      (b) =>
        b.accountNumber.includes(query) ||
        b.bankName.toLowerCase().includes(query),
    );
  }

  clearSearch() {
    this.searchForm.get('query')?.setValue('');
    this.loadBeneficiaries();
  }

  /* ===========================
     🏦 FETCH BANKS
     =========================== */

  fetchBanks() {
    this.userService.getBanks().subscribe({
      next: (res: GetBankResponse) => {
        this.banks = res.data.filter(
          (bank) =>
            bank.active &&
            !bank.is_deleted &&
            bank.supports_transfer &&
            bank.country === 'Nigeria',
        );

        this.filteredBanks = this.banks;
      },
      error: (error) => {
        this.banks = [];
        this.filteredBanks = [];
        this.snackBar.open('Failed to load banks', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
