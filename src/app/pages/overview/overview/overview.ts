import {
  Component,
  inject,
  OnInit,
  HostListener,
  ElementRef,
} from '@angular/core';
import {
  CurrencyPipe,
  TitleCasePipe,
  DatePipe,
  DecimalPipe,
  CommonModule,
} from '@angular/common';
import { forkJoin } from 'rxjs';
import { UserService } from '../../../core/service/user/user-service';
import { WalletService } from '../../../core/service/wallet/wallet-service';
import { TransactionData } from '../../../model/app.model';
import { RouterLink, Router } from '@angular/router';
import { TransferService } from '../../../core/service/transfer/transfer-service';

@Component({
  selector: 'app-overview',
  imports: [RouterLink, CommonModule, CurrencyPipe, TitleCasePipe, DecimalPipe],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  constructor(private el: ElementRef) {}
  private userService = inject(UserService);
  // private router = inject(Router);
  private walletService = inject(WalletService);
  private transferService = inject(TransferService);

  userName = '';
  balance = 0;
  profileOpen = false;
  mobileNavOpen = false;
  showBalance = true;
  recentTransactions: TransactionData[] = [];

  // ngOnInit(): void {
  //   this.balanceSummary();
  //   this.userService.getUserDetail().subscribe({
  //     next: (res) => {
  //       this.userName = res.data.lastName ?? 'User';
  //     },
  //   });
  // }

  // ngOnInit(): void {
  //   forkJoin({
  //     balance: this.walletService.balance$,
  //     transactions: this.transferService.getTransactions(),
  //   }).subscribe(({ balance, transactions }) => {
  //     this.balance = balance;
  //     this.recentTransactions = transactions.data.slice(0, 5); // Get the 5 most recent transactions
  //   });

  //   this.loadUserData();
  //   this.walletService.refreshBalance(); // Ensure we have the latest balance on init

  //   // this.walletService.balance$.subscribe((balance) => {
  //   //   this.balance = balance;
  //   // });

  //   // this.loadUserData();
  //   // this.walletService.refreshBalance(); // Ensure we have the latest balance on init

  //   // this.transferService.getTransferHistory().subscribe({
  //   //   next:(response)=>{
  //   //     this.recentTransactions=response.data.slice(0,5); // Get the 5 most recent transactions
  //   //   }
  //   // })
  // }

  ngOnInit(): void {
    // Load user data
    this.loadUserData();

    // Load balance reactively
    this.walletService.balance$.subscribe((balance) => {
      this.balance = balance;
    });

    // Refresh wallet balance
    this.walletService.refreshBalance();

    // Subscribe to transactions
    this.transferService.transactions$.subscribe((transactions) => {
      console.log('Transactions from BehaviorSubject:', transactions);
      this.recentTransactions = transactions.slice(0, 5);
    });

    // Fetch initial transactions
    this.transferService.fetchTransactions().subscribe((res) => {
      console.log('API Response:', res);
    });
  }

  loadUserData() {
    this.userService.getUserDetail().subscribe({
      next: (respond) => {
        this.userName = respond.data.lastName ?? 'User';
      },
    });
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.el.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.profileOpen = false;
      this.mobileNavOpen = false;
    }
  }

  toggleBalance(event: Event) {
    event.stopPropagation(); // 🔑 prevents navigation
    this.showBalance = !this.showBalance;
  }

  balanceSummary() {
    this.userService.myWalletDetails().subscribe({
      next: (res) => {
        this.balance = res.data.balance;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  // logout() {
  //   localStorage.removeItem('token');
  //   this.router.navigate(['/auth/login']);
  // }
}
