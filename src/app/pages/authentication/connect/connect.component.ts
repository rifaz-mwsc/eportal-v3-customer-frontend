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
        next: (response) => {
          this.loading = false;
          console.log('Authentication successful', response);
          
          // Redirect to the home page or dashboard
          this.router.navigate(['/dashboards/dashboard1']);
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Authentication failed. Please try again.';
          console.error('Authentication error:', error);
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/authentication/login']);
          }, 3000);
        }
      });
    });
  }
}
