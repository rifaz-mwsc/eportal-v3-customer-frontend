import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip adding token for the efaas authentication endpoint
    if (request.url.includes('/api/v1/auth/efaas')) {
      return next.handle(request);
    }

    // Get the access token
    const accessToken = this.authService.getAccessToken();

    // Clone the request and add the authorization header if token exists
    if (accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    // Handle the request and catch errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If we get a 401 Unauthorized error, clear auth data and redirect to login
        if (error.status === 401) {
          this.authService.clearAuthData();
          this.router.navigate(['/authentication/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
}
