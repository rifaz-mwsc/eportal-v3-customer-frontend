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

    // Check if token is about to expire and refresh if needed
    if (this.authService.isTokenExpiringSoon() && !this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshAccessToken().pipe(
        switchMap((authItem) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(authItem.accessToken);
          return next.handle(this.addTokenToRequest(request, authItem.accessToken));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.clearAuthData();
          this.router.navigate(['/authentication/login']);
          return throwError(() => error);
        })
      );
    }

    // Get the access token
    const accessToken = this.authService.getAccessToken();

    // Clone the request and add the authorization header if token exists
    if (accessToken) {
      request = this.addTokenToRequest(request, accessToken);
    }

    // Handle the request and catch errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If we get a 401 Unauthorized error, try to refresh the token
        if (error.status === 401) {
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
          return next.handle(this.addTokenToRequest(request, authItem.accessToken));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.clearAuthData();
          this.router.navigate(['/authentication/login']);
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

