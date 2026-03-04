import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { TransferRequest, TransferResponse } from '../../../model/app.model';

@Injectable({
  providedIn: 'root',
})
export class TransferService {
  private userUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create a new transfer
   * @param transferData - The transfer details
   * @returns Observable with transfer response
   */
  createTransfer(transferData: TransferRequest): Observable<TransferResponse> {
    return this.http.post<TransferResponse>(
      `${this.userUrl}/transactions/transfers`,
      transferData,
    );
  }

  /**
   * Get transfer history
   * @param page - Page number for pagination
   * @param limit - Items per page
   * @returns Observable with list of transfers
   */
  getTransferHistory(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.userUrl}/transfers/history`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
      },
    });
  }

  /**
   * Get a single transfer by ID
   * @param transferId - The transfer ID
   * @returns Observable with transfer details
   */
  getTransferById(transferId: string): Observable<TransferResponse> {
    return this.http.get<TransferResponse>(
      `${this.userUrl}/transfers/${transferId}`,
    );
  }
}
