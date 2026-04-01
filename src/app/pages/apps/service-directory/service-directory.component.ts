import { Component, inject, signal } from '@angular/core';
import { ServiceDirectoryService } from 'src/app/services/apps/service-directory/service-directory.service';
import { ServiceDirectory } from './service-directory';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { 
  ServiceRequestService, 
  ServiceRequestWithType
} from '../../../services/service-request.service';
import { ProfileDelegationComponent } from '../profile-content/profile-delegation/profile-delegation.component';

@Component({
  selector: 'app-service-directory',
  templateUrl: './service-directory.component.html',
  standalone: true,
  styles: `
    .mat-bg-error-container {
  background-color: var(--mat-sys-error-container);
}
.mat-bg-error {
  background-color: var(--mat-sys-error);
}
  `,
  imports: [
    CommonModule,
    MatCardModule,
    TablerIconsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    RouterModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
  ],
})
export class ServiceDirectoryComponent {
  serviceList = signal<ServiceRequestWithType[]>([]);
  allServices: ServiceRequestWithType[] = [];
  selectedCategory = signal<string>('All');
  isLoading = signal<boolean>(false);
  private serviceRequestService = inject(ServiceRequestService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  constructor(private serviceDirectoryService: ServiceDirectoryService) {
    // Remove static data loading
  }
  
  ngOnInit() {
    this.loadServiceRequests();
  }

  /**
   * Load service requests from API
   */
  loadServiceRequests() {
    this.isLoading.set(true);
    this.serviceRequestService.getAllServiceRequestsWithType().subscribe({
      next: (services) => {
        this.allServices = services;
        this.serviceList.set(services);
        this.isLoading.set(false);
        console.log('Loaded service requests:', services);
      },
      error: (error) => {
        console.error('Error loading service requests:', error);
        this.isLoading.set(false);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.serviceList.set(this.filter(filterValue));
  }

  filter(v: string): ServiceRequestWithType[] {
    return this.allServices.filter(
      (service) => service.name.toLowerCase().indexOf(v.toLowerCase()) !== -1
    );
  }

  ddlChange(event: any): void {
    const selectedValue = event.value;
    this.selectedCategory.set(selectedValue);
    
    if (selectedValue === 'All') {
      this.serviceList.set(this.allServices);
    } else {
      const filteredServices = this.allServices.filter(
        (service) => service.requestTypeName === selectedValue
      );
      this.serviceList.set(filteredServices);
    }
  }

  /**
   * Get unique request type names for category dropdown
   */
  getCategories(): string[] {
    const categories = new Set(this.allServices.map(s => s.requestTypeName));
    return ['All', ...Array.from(categories)];
  }

  onServiceClick(service: ServiceRequestWithType, event: Event): void {
    if (service.name === 'Profile Delegation Request') {
      event.preventDefault();
      event.stopPropagation();
      this.dialog.open(ProfileDelegationComponent, {
        width: '95vw',
        maxWidth: '1200px',
        height: '90vh',
      });
    }
  }
}
