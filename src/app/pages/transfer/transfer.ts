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
import { WalletService } from '../../core/service/wallet/wallet-service';
import {
  Beneficiary,
  BeneficiaryResponse,
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
  private walletService = inject(WalletService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  beneficiaries: Beneficiary[] = [];
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

  userBalance = 0;

  showPinModal = false;
  pendingTransferData: any = null;

  ngOnInit(): void {
    this.initForms();
    this.fetchBanks();
    this.loadBeneficiaries();
    this.watchAccountNumber();
    this.loadUserDetails();

    this.walletService.balance$.subscribe((balance) => {
      this.userBalance = balance;
    });

    this.walletService.refreshBalance();
  }

  /* ===========================
     👤 USER DETAILS
     =========================== */

  // In transfer.ts
  private loadUserDetails() {
    console.log('🔄 Loading user details...');

    this.userService.getUserDetail().subscribe({
      next: (res: UserResponse) => {
        console.log('✅ User details response:', res); // Log full response
        console.log('User data object:', res.data); // Log just the data

        this.userId = res.data.id;
        console.log('User ID set to:', this.userId); // This should show the ID

        // Also log to verify the structure matches
        console.log('Response structure check:', {
          hasData: !!res.data,
          hasId: !!res.data?.id,
          idValue: res.data?.id,
        });
      },
      error: (error) => {
        console.error('❌ Failed to load user details:', error);
        console.error('Error status:', error.status);
        console.error('Error details:', error.error);

        this.snackBar.open('Failed to load user details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  // getUserBalance() {
  //   this.walletService.getCurrentBalance().subscribe({
  //     next: (res: any) => {
  //       this.userBalance = res.data?.balance || res.balance || res;
  //     },
  //     error: (error) => {
  //       console.error('❌ Failed to load user balance:', error);
  //       console.error('Error status:', error.status);
  //       console.error('Error details:', error.error);
  //     },
  //   });
  // }

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

  closeBankDropdown() {
    this.bankOpen = false;
  }

  selectBank(bank: Bank) {
    this.selectedBank = bank;

    this.selectedBankCode = bank.code.toString(); // Convert to string if needed

    this.bankQuery = bank.name;
    this.bankOpen = false;

    if (this.accountForm.get('accountNumber')?.value?.length === 10) {
      this.resolveAccount();
    }
  }

  resolveAccount() {
    const { accountNumber } = this.accountForm.value;

    // This will now check for bank.id instead of bank.code
    if (!accountNumber || !this.selectedBankCode) {
      console.log('Missing required fields:', {
        accountNumber,
        selectedBankCode: this.selectedBankCode,
      });
      return;
    }

    console.log('Resolving account with:', {
      accountNumber,
      bankCode: this.selectedBankCode, // Now this will be the bank ID
      bankName: this.selectedBank?.name,
    });

    this.userService
      .resolveAccount(accountNumber, this.selectedBankCode)
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

    this.pendingTransferData = {
      amount: Number(this.accountForm.value.amount),
      bankName: this.selectedBank.name,
      accountNumber: this.accountForm.value.accountNumber,
      accountName: this.resolvedAccountName,
      bankCode: this.selectedBankCode,
      narration: this.accountForm.value.narration,
      saveBeneficiary: this.accountForm.value.saveAsBeneficiary,
    };

    this.showPinModal = true;
  }

  /* ===========================
     🔐 PIN CONFIRMATION
     =========================== */

  onPinConfirmed(pin: string) {
    this.showPinModal = false;

    if (!this.pendingTransferData) return;

    const transferRequest: TransferRequest = {
      amount: this.pendingTransferData.amount,
      bankName: this.pendingTransferData.bankName,
      accountNumber: this.pendingTransferData.accountNumber,
      accountName: this.pendingTransferData.accountName,
      bankCode: this.pendingTransferData.bankCode,
      narration: this.pendingTransferData.narration,
      pin: pin,
      categoryId: this.userId,
      saveBeneficiary: this.pendingTransferData.saveBeneficiary, // ✅ Changed from saveAsBeneficiary
    };

    console.log('Transfer request:', transferRequest);
    this.executeTransfer(transferRequest);
  }

  /* ===========================
     🚀 EXECUTE TRANSFER
     =========================== */

  private executeTransfer(transferRequest: TransferRequest) {
    if (this.isLoading) return;

    this.isLoading = true;

    console.log('Sending transfer request:', transferRequest.saveBeneficiary);

    this.transferService.createTransfer(transferRequest).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.snackBar.open(
          `Transfer successful! Reference: ${response.data.reference}`,
          'Close',
          { duration: 5000, panelClass: ['success-snackbar'] },
        );

        this.walletService.refreshBalance();

        // ✅ IMPORTANT: If user wanted to save as beneficiary, reload from API
        if (transferRequest.saveBeneficiary) {
          console.log(
            '🔄 Beneficiary was saved on backend, reloading from API...',
          );
          setTimeout(() => {
            this.loadBeneficiaries(); // This will fetch from your API
          }, 500);
        }

        this.resetForm();
      },
      error: (error) => {
        // ... error handling
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

  getInitials(name: string): string {
    if (!name) return 'B';

    // Split the name into words
    const words = name.trim().split(' ');

    if (words.length === 1) {
      // If only one word, take first two letters or just first letter
      return words[0].substring(0, 2).toUpperCase();
    }

    // Take first letter of first word and first letter of last word
    const firstInitial = words[0].charAt(0);
    const lastInitial = words[words.length - 1].charAt(0);

    return (firstInitial + lastInitial).toUpperCase();
  }

  loadBeneficiaries() {
    console.log('🔄 Loading beneficiaries from API...');

    this.userService.getBeneficiaries().subscribe({
      next: (response: BeneficiaryResponse) => {
        console.log('✅ Beneficiaries loaded:', response);

        // ✅ CORRECT: response.data is an array of beneficiary objects
        // Each object has: accountName, accountNumber, bankName, bankCode, etc.
        this.beneficiaries = response.data; // This matches your Beneficiary[] type
        console.log('Updated beneficiaries array:', this.beneficiaries);
      },
      error: (error) => {
        console.error('❌ Failed to load beneficiaries:', error);
        this.beneficiaries = [];
      },
    });
  }

  // private saveBeneficiary(beneficiary: {
  //   accountNumber: string;
  //   accountName: string;
  //   bankName: string;
  //   bankCode: string;
  // }) {
  //   const exists = this.beneficiaries.some(
  //     (b) =>
  //       b.accountNumber === beneficiary.accountNumber &&
  //       b.bankCode === beneficiary.bankCode,
  //   );

  //   if (!exists) {
  //     this.beneficiaries.push(beneficiary);
  //     localStorage.setItem('beneficiaries', JSON.stringify(this.beneficiaries));

  //     this.snackBar.open('Beneficiary saved successfully', 'Close', {
  //       duration: 2000,
  //     });
  //   }
  // }

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
