import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserService } from '../user/user-service';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private balanceSubject = new BehaviorSubject<number>(0);
  balance$ = this.balanceSubject.asObservable();

  constructor(private userService: UserService) {}

  refreshBalance(): void {
    this.userService.myWalletDetails().subscribe({
      next: (response) => {
        this.balanceSubject.next(response.data.balance);
      },
      error: (error) => {
        console.error('Failed to refresh wallet balance:', error);
      },
    });
  }

  getCurrentBalance(): number {
    return this.balanceSubject.getValue();
  }

  updateBalance(amount: number): void {
    this.balanceSubject.next(amount);
  }
}
