import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss']
})
export class ConnectComponent implements OnInit {
  loading = true;
  error: string | null = null;
  errorDetails: string[] = [];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    // Get the efaas token from URL parameters
    this.route.queryParams.subscribe(params => {
      const efaasToken = params['eportal_efaas_idtoken'];
      
      if (!efaasToken) {
        this.error = 'No authentication token provided';
        this.loading = false;
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/authentication/login']);
        }, 3000);
        return;
      }

      // Validate the efaas token
      this.authService.validateEfaasToken(efaasToken).subscribe({
        next: (item) => {
          this.loading = false;
          console.log('Authentication successful', item);
          
          // Redirect to the home page or dashboard
          this.router.navigate(['/dashboards/dashboard1']);
        },
        error: (error) => {
          this.loading = false;
          
          // Extract error message and details
          if (error.statusMessage) {
            this.error = error.statusMessage;
          } else if (error.error?.statusMessage) {
            this.error = error.error.statusMessage;
          } else {
            this.error = 'Authentication failed. Please try again.';
          }
          
          // Extract error details
          const errorDetailsObj = error.errorDetails || error.error?.errorDetails;
          if (errorDetailsObj) {
            this.errorDetails = [];
            Object.keys(errorDetailsObj).forEach(key => {
              const messages = errorDetailsObj[key];
              if (Array.isArray(messages)) {
                this.errorDetails.push(...messages);
              } else {
                this.errorDetails.push(messages);
              }
            });
          }
          
          console.error('Authentication error:', error);
          
          // Redirect to login after 5 seconds
          setTimeout(() => {
            this.router.navigate(['/authentication/login']);
          }, 5000);
        }
      });
    });
  }
}
