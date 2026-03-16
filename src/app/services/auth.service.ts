import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Address {
  id: string;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  addressLine4: string | null;
  postalCode: string | null;
  atoll: string | null;
  island: string | null;
  addressType: string | null;
  isDefault: boolean;
}

export interface UpdateAddressRequest {
  addressId: string;
  profileId: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  postalCode?: string;
  islandId: number;
  addressTypeId: number;
}

export interface UserProfile {
  id: string;
  isDefault: boolean;
  isActive: boolean;
  isVerified: boolean;
  profileType: string; // "Individual" or "Entity"
  // Individual profile fields
  identityNumber: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  gender: string | null;
  nationality: string | null;
  dob: string | null;
  email: string;
  mobileNo: string | null;
  // Entity profile fields
  entityName: string | null;
  registrationNumber: string | null;
  entityType: string | null;
  // Address
  permanentAddress: Address | null;
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

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private tokenRefreshTimer: any = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Set initial authentication state after BehaviorSubject is initialized
    const hasToken = this.hasValidToken();
    this.isAuthenticatedSubject.next(hasToken);
    
    // Initialize token refresh timer if user is already authenticated
    if (hasToken) {
      this.scheduleTokenRefresh();
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    // Clear any existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    const timeUntilExpiry = this.getTimeUntilExpiry();
    const fiveMinutesInMs = 5 * 60 * 1000;

    // Schedule refresh 5 minutes before expiry
    const refreshTime = Math.max(0, timeUntilExpiry - fiveMinutesInMs);

    this.tokenRefreshTimer = setTimeout(() => {
      console.log('Attempting automatic token refresh...');
      this.refreshAccessToken().subscribe({
        next: () => {
          console.log('Token refreshed automatically');
          this.scheduleTokenRefresh(); // Schedule next refresh
        },
        error: (error) => {
          console.error('Automatic token refresh failed:', error);
          // Don't logout on automatic refresh failure
          // The user might still have a valid token
          // Let the 401 error from API calls handle the logout if needed
          // Try to schedule refresh again in case it was a temporary network issue
          const oneMinuteInMs = 60 * 1000;
          setTimeout(() => {
            if (this.hasValidToken()) {
              this.scheduleTokenRefresh();
            }
          }, oneMinuteInMs);
        }
      });
    }, refreshTime);
  }

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
    
    // Get the default profile and store user data
    const defaultProfile = item.userProfiles.find(p => p.isDefault) || item.userProfiles[0];
    if (defaultProfile) {
      this.updateUserDataFromProfile(defaultProfile, item.userProfiles);
    }

    // Schedule automatic token refresh
    this.scheduleTokenRefresh();
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
   * Fetch user profiles from the API
   * This refreshes the user profile data without re-authenticating
   */
  getUserProfiles(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(
      `${environment.apiBaseUrl}/api/v1/profiles`
    ).pipe(
      tap(profiles => {
        // Update stored user data with fresh profile information
        if (profiles && profiles.length > 0) {
          const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];
          this.updateUserDataFromProfile(defaultProfile, profiles);
        }
      }),
      catchError(error => {
        console.error('Error fetching user profiles:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update profile address
   */
  updateProfileAddress(data: UpdateAddressRequest): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(
      `${environment.apiBaseUrl}/api/v1/profiles/address`,
      data
    ).pipe(
      catchError(error => {
        console.error('Error updating address:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Switch to a different active profile
   */
  switchActiveProfile(profile: UserProfile): void {
    const allProfiles = this.getUserData()?.userProfiles || [];
    this.updateUserDataFromProfile(profile, allProfiles);
  }

  /**
   * Update stored user data with profile information
   */
  private updateUserDataFromProfile(defaultProfile: UserProfile, allProfiles: UserProfile[]): void {
    // Construct full name based on profile type
    let fullName = '';
    if (defaultProfile.profileType === 'Individual') {
      const nameParts = [
        defaultProfile.firstName,
        defaultProfile.middleName,
        defaultProfile.lastName
      ].filter(part => part && part.trim());
      fullName = nameParts.join(' ');
    } else if (defaultProfile.profileType === 'Entity') {
      fullName = defaultProfile.entityName || '';
    }
    
    // Store updated user data
    const userData = {
      name: fullName,
      email: defaultProfile.email,
      phoneNumber: defaultProfile.mobileNo,
      idNumber: defaultProfile.identityNumber,
      firstName: defaultProfile.firstName,
      middleName: defaultProfile.middleName,
      lastName: defaultProfile.lastName,
      gender: defaultProfile.gender,
      nationality: defaultProfile.nationality,
      dob: defaultProfile.dob,
      profileType: defaultProfile.profileType,
      // Entity fields
      entityName: defaultProfile.entityName,
      registrationNumber: defaultProfile.registrationNumber,
      entityType: defaultProfile.entityType,
      // Address
      permanentAddress: defaultProfile.permanentAddress,
      // Status flags
      isDefault: defaultProfile.isDefault,
      isActive: defaultProfile.isActive,
      isVerified: defaultProfile.isVerified,
      userProfiles: allProfiles
    };
    
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
  }

  /**
   * Refresh the access token using the refresh token
   */
  refreshAccessToken(): Observable<AuthItem> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return throwError(() => new Error('No tokens available for refresh'));
    }

    const body = {
      accessToken: accessToken,
      refreshToken: refreshToken
    };

    return this.http.post<AuthResponse>(
      `${environment.apiBaseUrl}/api/v1/auth/refreshtoken`,
      body
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
        // Update stored auth data with new tokens
        this.storeAuthData(item);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        // Don't automatically logout here - let the caller decide
        // This prevents sudden logouts during API usage
        return throwError(() => error);
      })
    );
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
    const isValid = Date.now() < expiryTimestamp;

    // If token is expired, clear auth data
    if (!isValid) {
      this.clearAuthData();
      return false;
    }

    // Also check if user data exists
    const userData = this.getUserData();
    if (!userData || !userData.name) {
      this.clearAuthData();
      return false;
    }

    return true;
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) {
      return false;
    }

    const expiryTimestamp = parseInt(expiry, 10);
    const fiveMinutesInMs = 5 * 60 * 1000;
    return Date.now() > (expiryTimestamp - fiveMinutesInMs);
  }

  /**
   * Get time until token expiry in milliseconds
   */
  getTimeUntilExpiry(): number {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) {
      return 0;
    }

    const expiryTimestamp = parseInt(expiry, 10);
    return Math.max(0, expiryTimestamp - Date.now());
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
    // Clear the refresh timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

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
    // Clear the refresh timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.isAuthenticatedSubject.next(false);
  }
}
