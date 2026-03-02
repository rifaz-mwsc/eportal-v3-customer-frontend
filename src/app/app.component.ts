import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LookupService } from './services/lookup.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'Modernize Angular Admin Tempplate';
  
  private authService = inject(AuthService);
  private lookupService = inject(LookupService);
  private router = inject(Router);

  ngOnInit() {
    // Check authentication status on app initialization
    // This ensures expired tokens are cleared when the browser is reopened
    if (!this.authService.isAuthenticated()) {
      // Only redirect to login if user is trying to access a protected route
      const currentUrl = this.router.url;
      const publicRoutes = ['/authentication', '/connect', '/landingpage', '/front-pages'];
      const isPublicRoute = publicRoutes.some(route => currentUrl.startsWith(route));
      
      if (!isPublicRoute && currentUrl !== '/') {
        console.warn('Session expired, redirecting to login');
        this.authService.clearAuthData();
        this.router.navigate(['/authentication/login']);
      }
    } else {
      // Preload lookup data for authenticated users
      this.lookupService.preloadLookupData();
    }
  }
}
