import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environment/environment';
import {
  UserResponse,
  GetBankResponse,
  ResolveAccountResponse,
  BankDetailsResponse,
  WalletDetailsResponse,
  BeneficiaryResponse,
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

  // In user-service.ts - Add more detailed logging
  getUserDetail(): Observable<UserResponse> {
    console.log(
      '🔍 Making getUserDetail API call to:',
      `${this.userUrl}/user/me`,
    );

    return this.http.get<UserResponse>(`${this.userUrl}/user/me`).pipe(
      tap({
        next: (response) => {
          console.log('✅ getUserDetail raw response:', response);
          console.log('✅ getUserDetail data:', response.data);
          console.log('✅ User ID from API:', response.data?.id);
        },
        error: (error) => {
          console.error('❌ getUserDetail failed:', error);
          console.error('Status:', error.status);
          console.error('Error body:', error.error);
        },
      }),
    );
  }

  getBanks(): Observable<GetBankResponse> {
    return this.http.get<GetBankResponse>(`${this.userUrl}/user/banks`);
  }

  resolveAccount(
    accountNumber: string,
    bankCode: string,
  ): Observable<ResolveAccountResponse> {
    // Basic client-side validation
    if (
      !accountNumber ||
      accountNumber.length < 5 ||
      !/^\d+$/.test(accountNumber)
    ) {
      // Or throw a more specific error/handle in UI
      console.error('Invalid account number provided.');
      return throwError(() => new Error('Invalid account number.'));
    }
    if (!bankCode || bankCode.length < 3 || !/^\d+$/.test(bankCode)) {
      // Or throw a more specific error/handle in UI
      console.error('Invalid bank code provided.');
      return throwError(() => new Error('Invalid bank code.'));
    }

    const url = `${this.userUrl}/user/resolve-account?accountNumber=${accountNumber}&bankCode=${bankCode}`;
    return this.http
      .get<ResolveAccountResponse>(url)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('🚨 Error in UserService:', {
      status: error.status,
      message: error.message,
      error: error.error,
    });
    return throwError(() => error);
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

  getBeneficiaries(): Observable<BeneficiaryResponse> {
    // Log the full URL
    const url = `${this.userUrl}/user/beneficiaries`; // Is this correct?
    console.log('Calling beneficiaries URL:', url);
    return this.http.get<BeneficiaryResponse>(url);
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
