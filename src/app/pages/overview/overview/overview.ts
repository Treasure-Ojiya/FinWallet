import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { UserService } from '../../../core/service/user/user-service';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-overview',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  userName = '';
  balance = 0;
  profileOpen = false;
  showBalance = true;

  ngOnInit(): void {
    this.balanceSummary();
    this.userService.getUserDetail().subscribe({
      next: (res) => {
        this.userName = res.data.lastName ?? 'User';
      },
    });
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
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

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}
