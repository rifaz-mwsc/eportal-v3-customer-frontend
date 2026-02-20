import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  'as:client_id': string;
  'as:device': string;
  userName: string;
  Name: string;
  Email: string;
  userType: string;
  is_premium_subscription: string;
  premium_subscription_type: string;
  show_new_features: string;
  can_manage_utility_accounts: string;
  can_apply_for_utility_service: string;
  show_utility_services: string;
  is_efaas: string;
  phone_number: string;
  idnumber: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  nationality: string;
  '.issued': string;
  '.expires': string;
}

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
  validateEfaasToken(efaasToken: string): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('token', efaasToken);
    formData.append('device', 'eportal');
    formData.append('client', 'ePortal');

    return this.http.post<AuthResponse>(
      `${environment.apiBaseUrl}/api/v1/auth/efaas`,
      formData
    ).pipe(
      tap(response => {
        this.storeAuthData(response);
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
  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
    
    // Calculate and store token expiry timestamp
    const expiryTimestamp = Date.now() + (response.expires_in * 1000);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTimestamp.toString());
    
    // Store user data
    const userData = {
      userName: response.userName,
      name: response.Name,
      email: response.Email,
      userType: response.userType,
      isPremiumSubscription: response.is_premium_subscription === 'True',
      premiumSubscriptionType: response.premium_subscription_type,
      showNewFeatures: response.show_new_features === 'True',
      canManageUtilityAccounts: response.can_manage_utility_accounts === 'True',
      canApplyForUtilityService: response.can_apply_for_utility_service === 'True',
      showUtilityServices: response.show_utility_services === 'True',
      isEfaas: response.is_efaas === 'True',
      phoneNumber: response.phone_number,
      idNumber: response.idnumber,
      firstName: response.first_name,
      middleName: response.middle_name,
      lastName: response.last_name,
      nationality: response.nationality
    };
    
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
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
