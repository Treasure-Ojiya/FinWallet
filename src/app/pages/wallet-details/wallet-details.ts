import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../core/service/user/user-service';

@Component({
  selector: 'app-wallet-details',
  imports: [],
  templateUrl: './wallet-details.html',
  styleUrl: './wallet-details.css',
})
export class WalletDetails implements OnInit {
  private userService = inject(UserService);

  currentBalance = 0;

  ngOnInit(): void {
    this.getWalletDetails();
  }

  getWalletDetails() {
    this.userService.myWalletDetails().subscribe({
      next: (res) => {
        this.currentBalance = res.data.balance;
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
