// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { shareReplay } from 'rxjs/operators';
// import { environment } from '../../../../environment/environment';
// import {
//   TransferRequest,
//   TransferResponse,
//   BeneficiaryResponse,
//   TransactionData,
//   TransactionResponse,
// } from '../../../model/app.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class TransferService {
//   private userUrl = environment.baseUrl;
//   private transactions$?: Observable<TransactionResponse>;

//   constructor(private http: HttpClient) {}

//   /**
//    * Create a new transfer
//    * @param transferData - The transfer details
//    * @returns Observable with transfer response
//    */
//   createTransfer(transferData: TransferRequest): Observable<TransferResponse> {
//     return this.http.post<TransferResponse>(
//       `${this.userUrl}/transactions/transfer`,
//       transferData,
//     );
//   }

//   /**
//    * Get transfer history
//    * @param page - Page number for pagination
//    * @param limit - Items per page
//    * @returns Observable with list of transfers
//    */
//   getTransferHistory(page: number = 1, limit: number = 10): Observable<any> {
//     return this.http.get(`${this.userUrl}/transfers/history`, {
//       params: {
//         page: page.toString(),
//         limit: limit.toString(),
//       },
//     });
//   }

//   /**
//    * Get a single transfer by ID
//    * @param transferId - The transfer ID
//    * @returns Observable with transfer details
//    */
//   getTransferById(transferId: string): Observable<TransferResponse> {
//     return this.http.get<TransferResponse>(
//       `${this.userUrl}/transfers/${transferId}`,
//     );
//   }

//   getTransactions(): Observable<TransactionResponse> {
//     if (!this.transactions$) {
//       this.transactions$ = this.http
//         .get<TransactionResponse>(
//           `${this.userUrl}/transactions/transactions?=null`,
//         )
//         .pipe(shareReplay(1));
//     }

//     return this.transactions$;
//   }

//   clearTransactionCache() {
//     this.transactions$ = undefined;
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environment/environment';
import {
  TransferRequest,
  TransferResponse,
  TransactionData,
  TransactionResponse,
  PaginationOption,
} from '../../../model/app.model';

@Injectable({
  providedIn: 'root',
})
export class TransferService {
  private userUrl = environment.baseUrl;

  // BehaviorSubject holds the current transactions
  private transactionsSubject = new ReplaySubject<TransactionData[]>(1);
  // Expose as observable for components to subscribe to
  transactions$ = this.transactionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Create a new transfer
   * Automatically refreshes transactions after success
   */
  createTransfer(transferData: TransferRequest): Observable<TransferResponse> {
    return this.http
      .post<TransferResponse>(
        `${this.userUrl}/transactions/transfer`,
        transferData,
      )
      .pipe(
        tap(() => {
          // Refresh transactions automatically
          this.fetchTransactions().subscribe();
        }),
      );
  }

  fetchTransactions(
    options?: PaginationOption,
  ): Observable<TransactionResponse> {
    let params = new HttpParams();

    if (options) {
      if (options.page) params = params.set('page', options.page.toString());
      if (options.perPage)
        params = params.set('perPage', options.perPage.toString());
    }

    return this.http
      .get<TransactionResponse>(`${this.userUrl}/transactions/transactions`, {
        params,
      })
      .pipe(
        tap((res) => {
          console.log('Fetched transactions:', res.data);
          this.transactionsSubject.next(res.data);
        }),
      );
  }

  /**
   * Optional: manual cache reset (rarely needed now)
   */
  clearTransactionCache() {
    this.transactionsSubject.next([]);
  }

  /**
   * Other existing methods
   */
  // getTransferHistory(page: number = 1, limit: number = 10): Observable<any> {
  //   return this.http.get(`${this.userUrl}/transfers/history`, {
  //     params: {
  //       page: page.toString(),
  //       limit: limit.toString(),
  //     },
  //   });
  // }

  // getTransferById(transferId: string): Observable<TransferResponse> {
  //   return this.http.get<TransferResponse>(
  //     `${this.userUrl}/transfers/${transferId}`,
  //   );
  // }
}
