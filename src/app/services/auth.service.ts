import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface IndividualProfile {
  identityNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  nationality: string;
  dob: string | null;
  email: string;
  contact: string;
}

export interface Profile {
  name: string;
  profileType: string | null;
  isActive: boolean;
  individualProfile: IndividualProfile | null;
  entityProfile: any | null;
}

export interface UserProfile {
  isDefault: boolean;
  isActive: boolean;
  isVerified: boolean;
  profile: Profile;
}

export interface AuthItem {
  accessToken: string;
  accessTokenExpiresOn: string;
  tokenType: string;
  refreshToken: string;
  refreshTokenExpiresOn: string;
  userProfiles: UserProfile[];
}

export interface ApiResponse<T> {
  item: T | null;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: string[] };
}

export type AuthResponse = ApiResponse<AuthItem>;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Validate the efaas token and get the access token
   */
  validateEfaasToken(efaasToken: string): Observable<AuthItem> {
    const formData = new FormData();
    formData.append('token', efaasToken);
    formData.append('device', 'eportal');
    formData.append('client', 'ePortal');

    return this.http.post<AuthResponse>(
      `${environment.apiBaseUrl}/api/v1/auth/efaas`,
      formData
    ).pipe(
      map(response => {
        // Check if the response is successful
        if (!response.isSuccessful || !response.item) {
          throw {
            statusMessage: response.statusMessage,
            errorDetails: response.errorDetails
          };
        }
        return response.item;
      }),
      tap(item => {
        this.storeAuthData(item);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        console.error('Token validation failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(item: AuthItem): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, item.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, item.refreshToken);
    
    // Calculate and store token expiry timestamp from ISO date string
    const expiryDate = new Date(item.accessTokenExpiresOn);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryDate.getTime().toString());
    
    // Get the default profile
    const defaultProfile = item.userProfiles.find(p => p.isDefault) || item.userProfiles[0];
    
    if (defaultProfile && defaultProfile.profile.individualProfile) {
      const profile = defaultProfile.profile.individualProfile;
      
      // Store user data
      const userData = {
        name: defaultProfile.profile.name,
        email: profile.email,
        phoneNumber: profile.contact,
        idNumber: profile.identityNumber,
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        gender: profile.gender,
        nationality: profile.nationality,
        dob: profile.dob,
        isDefault: defaultProfile.isDefault,
        isActive: defaultProfile.isActive,
        isVerified: defaultProfile.isVerified,
        userProfiles: item.userProfiles
      };
      
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    }
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get user data
   */
  getUserData(): any {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if token exists and is valid
   */
  hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) {
      return false;
    }

    // Check if token has expired
    const expiryTimestamp = parseInt(expiry, 10);
    return Date.now() < expiryTimestamp;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/authentication/login']);
  }

  /**
   * Clear all auth data
   */
  clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.isAuthenticatedSubject.next(false);
  }
}
