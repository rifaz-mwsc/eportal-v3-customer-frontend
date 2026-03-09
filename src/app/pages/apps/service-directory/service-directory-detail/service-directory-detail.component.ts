import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceDirectoryService } from 'src/app/services/apps/service-directory/service-directory.service';
import { 
  ServiceRequestService, 
  ServiceRequestWithType,
  RequestPipelineGuideline 
} from 'src/app/services/service-request.service';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-directory-detail',
  templateUrl: './service-directory-detail.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    TablerIconsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CommonModule,
  ],
})
export class ServiceDirectoryComponentDetailComponent implements OnInit {
  id = signal<string>('');
  serviceDetail = signal<ServiceRequestWithType | null>(null);
  guidelines = signal<RequestPipelineGuideline[]>([]);
  isLoading = signal<boolean>(false);
  
  private serviceRequestService = inject(ServiceRequestService);

  constructor(
    private activatedRouter: ActivatedRoute,
    public serviceDirectoryService: ServiceDirectoryService,
    private router: Router
  ) {
    const routeId = this.activatedRouter?.snapshot?.paramMap?.get('id');
    if (routeId) {
      this.id.set(routeId);
    }
  }

  ngOnInit() {
    this.loadServiceDetails();
  }

  /**
   * Load service request details and guidelines from API
   */
  loadServiceDetails() {
    const serviceId = this.id();
    if (!serviceId) {
      console.error('No service ID provided');
      return;
    }

    this.isLoading.set(true);

    // Fetch service request details
    this.serviceRequestService.getServiceRequestById(serviceId).subscribe({
      next: (service) => {
        if (service) {
          // Convert ServiceRequest to ServiceRequestWithType
          this.serviceRequestService.getAllServiceRequestsWithType().subscribe({
            next: (allServices) => {
              const fullService = allServices.find(s => s.id === serviceId);
              if (fullService) {
                this.serviceDetail.set(fullService);
                console.log('Service details loaded:', fullService);
              }
              this.isLoading.set(false);
            },
            error: (error) => {
              console.error('Error loading full service details:', error);
              this.isLoading.set(false);
            }
          });
        } else {
          console.error('Service not found');
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading service:', error);
        this.isLoading.set(false);
      }
    });

    // Fetch guidelines
    this.serviceRequestService.getPipelineGuidelines(serviceId).subscribe({
      next: (guidelines) => {
        this.guidelines.set(guidelines);
        console.log('Guidelines loaded:', guidelines);
      },
      error: (error) => {
        console.error('Error loading guidelines:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/apps/ServiceDirectory']);
  }

  goApply(): void {
    // Navigate with service ID as route parameter and pass service details in state
    this.router.navigate(['/apps/my-applications/addApplication'], {
      queryParams: { 
        serviceId: this.id(),
        serviceName: this.serviceDetail()?.name 
      }
    });
    console.log('Apply Now clicked for service ID:', this.id());
    console.log('Service Name:', this.serviceDetail()?.name);
  }
}
