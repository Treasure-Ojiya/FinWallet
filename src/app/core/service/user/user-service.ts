import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Remove HttpParams if not needed
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environment/environment';
import {
  UserResponse,
  GetBankResponse,
  ResolveAccountResponse,
  BankDetailsResponse,
  WalletDetailsResponse,
  PinResponse,
  SetPinRequest,
  ChangePinRequest,
} from '../../../model/app.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getUserDetail(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.userUrl}/user/me`);
  }

  getBanks(): Observable<GetBankResponse> {
    return this.http.get<GetBankResponse>(`${this.userUrl}/user/banks`);
  }

  resolveAccountDetails(
    accountNumber: string,
    bankCode: string,
  ): Observable<ResolveAccountResponse> {
    // Use camelCase as the error message confirms the backend expects these exact names
    return this.http.get<ResolveAccountResponse>(
      `${this.userUrl}/user/resolve-account`,
      {
        params: {
          accountNumber: accountNumber, // camelCase as expected by backend
          bankCode: bankCode, // camelCase as expected by backend
        },
      },
    );
  }

  myBankDetails(): Observable<BankDetailsResponse> {
    return this.http.get<BankDetailsResponse>(
      `${this.userUrl}/user/my-bank-details`,
    );
  }

  myWalletDetails(): Observable<WalletDetailsResponse> {
    return this.http.get<WalletDetailsResponse>(
      `${this.userUrl}/user/my-wallet-details`,
    );
  }

  /**
   * Set transaction PIN for the first time
   * Endpoint: PATCH /user/set-transaction-pin
   */
  setTransactionPin(pinData: SetPinRequest): Observable<PinResponse> {
    return this.http
      .patch<PinResponse>(`${this.userUrl}/user/set-transaction-pin`, pinData)
      .pipe(
        tap({
          next: (response) => {
            if (response.status === 'success') {
              // Store that PIN is set (but never store the actual PIN)
              localStorage.setItem('hasPin', 'true');
            }
          },
        }),
      );
  }

  /**
   * Change transaction PIN
   * Endpoint: PATCH /user/change-transaction-pin
   */
  changeTransactionPin(pinData: ChangePinRequest): Observable<PinResponse> {
    return this.http.patch<PinResponse>(
      `${this.userUrl}/user/change-transaction-pin`,
      pinData,
    );
  }

  /**
   * Check if user has PIN set (by checking local flag)
   * In a production app, you might want to verify this with the backend
   */
  hasPin(): boolean {
    return localStorage.getItem('hasPin') === 'true';
  }

  /**
   * Clear PIN flag on logout
   */
  clearPinFlag(): void {
    localStorage.removeItem('hasPin');
  }
}
