import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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

export interface ProfileType {
  id: string;
  name: string;
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
  private readonly PROFILES_URL = `${environment.apiBaseUrl}/api/v1/profiles/types`;

  constructor(private http: HttpClient) {}

  getProfileTypes(): Observable<ProfileType[]> {
    return this.http.get<ProfileType[]>(this.PROFILES_URL);
  }

  createDelegationRequest(data: DelegationRequest): Observable<DelegationRequestResponse> {
    console.log('Creating delegation request:', data);

    return this.http.post<DelegationRequestResponse>(this.BASE_URL, data).pipe(
      tap(response => {
        if (response.isSuccessful) {
          console.log('Delegation request created successfully');
        } else {
          console.error('Delegation request failed:', response.statusMessage, response.errorDetails);
        }
      })
    );
  }
}
