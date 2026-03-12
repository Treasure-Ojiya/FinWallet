import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransferService } from '../../core/service/transfer/transfer-service';
import { TransactionData } from '../../model/app.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit, OnDestroy {
  private transferService = inject(TransferService);
  private destroy$ = new Subject<void>();

  transactions: TransactionData[] = [];

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  currentFilter: string = 'all';

  ngOnInit(): void {
    this.transferService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.transactions = data;
        this.totalPages = Math.ceil(data.length / this.pageSize); // Add this
      });

    this.transferService
      .fetchTransactions({ page: 1, perPage: 10 })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Filtered transactions based on status
  get filteredTransactions(): TransactionData[] {
    if (this.currentFilter === 'all') {
      return this.transactions;
    }
    return this.transactions.filter((tx) => tx.status === this.currentFilter);
  }

  toLocalDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Helper methods
  getTotalCredit(): number {
    return this.transactions
      .filter((tx) => tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  getTotalDebit(): number {
    return this.transactions
      .filter((tx) => tx.type === 'debit')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  getSuccessRate(): number {
    if (this.transactions.length === 0) return 0;
    const completed = this.transactions.filter(
      (tx) => tx.status === 'completed',
    ).length;
    return Math.round((completed / this.transactions.length) * 100);
  }

  getTransactionDescription(tx: TransactionData): string {
    return tx.narration || tx.category || 'Transfer';
  }

  // Filter method
  filterByStatus(status: 'all' | 'completed' | 'pending' | 'failed'): void {
    this.currentFilter = status;
    this.currentPage = 1;
  }

  // Pagination methods
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.transferService
        .fetchTransactions({ page: page, perPage: this.pageSize })
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  getPageNumbers(): number[] {
    this.totalPages = Math.ceil(
      this.filteredTransactions.length / this.pageSize,
    );
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
