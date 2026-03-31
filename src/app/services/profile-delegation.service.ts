import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DelegationRequest {
  requestTypeId: string;
  serviceRequestId: string;
  identityNumber: string;
  requestedToProfileTypeId: string;
}

export interface DelegationRequestResponse {
  item: any;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: string[] };
}

// UI-only model for the approval list (design only)
export interface DelegationApproval {
  id: string;
  requestedBy: string;
  identityNumber: string;
  profileType: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Revoked';
}

@Injectable({
  providedIn: 'root',
})
export class ProfileDelegationService {
  private readonly BASE_URL = `${environment.apiBaseUrl}/api/v1/profiledelegationrequests`;

  constructor(private http: HttpClient) {}

  createDelegationRequest(data: DelegationRequest): Observable<DelegationRequestResponse> {
    console.log('Creating delegation request:', data);

    return this.http.post<DelegationRequestResponse>(this.BASE_URL, data).pipe(
      tap(response => {
        if (response.isSuccessful) {
          console.log('Delegation request created successfully');
        } else {
          console.error('Delegation request failed:', response.statusMessage, response.errorDetails);
        }
      }),
      catchError(error => {
        console.error('Error creating delegation request:', error);
        return of({
          item: null,
          isSuccessful: false,
          statusMessage: error.error?.statusMessage || 'Network error occurred',
          errorDetails: error.error?.errorDetails || { error: ['Unknown error'] },
        });
      })
    );
  }
}
