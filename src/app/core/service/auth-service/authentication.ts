import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { map, tap, Observable } from 'rxjs';
import {
  LoginModel,
  LoginResult,
  LoginApiResponse,
  RegModel,
  RegResponse,
  VerifyAccountResponse,
  OtpResponse,
} from '../../../model/app.model';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Authentication {
  private baseUrl = environment.baseUrl;
  private router = inject(Router);

  constructor(private http: HttpClient) {}

  login(model: LoginModel): Observable<LoginResult> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<LoginApiResponse>(`${this.baseUrl}/auth/login`, model, { headers })
      .pipe(
        tap((res) => {
          if (res.data.isVerified) {
            localStorage.setItem('token', res.data.access_token);
          }
        }),
        map((res) => ({
          accessToken: res.data.access_token,
          isVerified: res.data.isVerified,
        })),
      );
  }

  register(model: RegModel): Observable<RegResponse> {
    return this.http.post<RegResponse>(`${this.baseUrl}/auth/register`, model);
  }

  verifyAccount(payload: { email: string; otp: string }): Observable<void> {
    return this.http
      .patch<VerifyAccountResponse>(
        `${this.baseUrl}/auth/verify-account`,
        payload,
      )
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.data.access_token);
        }),
        map(() => void 0),
      );
  }

  resendOtp(email: string): Observable<void> {
    return this.http
      .patch<OtpResponse>(`${this.baseUrl}/auth/resend-otp/email`, { email })
      .pipe(map(() => void 0));
  }

  // Add to auth service
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  // Check token validity on app initialization
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
}
