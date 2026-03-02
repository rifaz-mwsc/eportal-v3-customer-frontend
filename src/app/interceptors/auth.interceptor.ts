import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip adding token for authentication endpoints
    if (request.url.includes('/api/v1/auth/efaas') || request.url.includes('/api/v1/auth/refreshtoken')) {
      return next.handle(request);
    }

    // Get the access token and add to request
    const accessToken = this.authService.getAccessToken();
    if (accessToken) {
      request = this.addTokenToRequest(request, accessToken);
    }

    // Handle the request and catch errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If we get a 401 Unauthorized error, try to refresh the token
        if (error.status === 401 && !request.url.includes('/api/v1/auth/refreshtoken')) {
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshAccessToken().pipe(
        switchMap((authItem) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(authItem.accessToken);
          // Retry the original request with new token
          return next.handle(this.addTokenToRequest(request, authItem.accessToken));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          console.error('Failed to refresh token after 401 error:', error);
          
          // Only logout if refresh token is actually invalid
          // Check if error indicates invalid refresh token
          if (error?.statusMessage === 'Unable to login' || 
              error?.errorDetails?.token?.includes('Invalid or expired token') ||
              error?.error?.statusMessage === 'Unable to login') {
            console.warn('Refresh token is invalid, logging out');
            this.authService.clearAuthData();
            this.router.navigate(['/authentication/login']);
          }
          
          return throwError(() => error);
        })
      );
    } else {
      // Wait for the token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenToRequest(request, token));
        })
      );
    }
  }
}

