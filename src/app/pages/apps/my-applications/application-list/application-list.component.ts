import {
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { ServiceRequestService, MyServiceRequest } from 'src/app/services/service-request.service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-application-list',
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.scss',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
})
export class AppMyApplicationListComponent implements OnInit {
  activeTab = signal<string>('All');
  allApplications = signal<MyServiceRequest[]>([]);
  filteredApplications = signal<MyServiceRequest[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  
  // Pagination
  totalCount = signal<number>(0);
  pageNumber = signal<number>(1);
  pageSize = signal<number>(100);

  constructor(
    private serviceRequestService: ServiceRequestService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadServiceRequests();
  }

  /**
   * Load service requests from API
   */
  loadServiceRequests(): void {
    this.isLoading.set(true);
    
    this.serviceRequestService.getMyServiceRequests(this.pageNumber(), this.pageSize())
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          
          if (response.isSuccessful) {
            this.totalCount.set(response.item.totalCount);
            this.allApplications.set(response.item.items);
            this.filterApplications();
            
            console.log('Loaded applications:', response.item.items.length);
          } else {
            this.showSnackbar('Failed to load applications: ' + response.statusMessage);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error loading applications:', error);
          this.showSnackbar('Error loading applications. Please try again.');
        }
      });
  }

  /**
   * Handle tab click to filter by status
   */
  handleTabClick(tab: string): void {
    this.activeTab.set(tab);
    this.filterApplications();
  }

  /**
   * Handle search input
   */
  filter(filterValue: string): void {
    this.searchQuery.set(filterValue);
    this.filterApplications();
  }

  /**
   * Filter applications by status and search query
   */
  filterApplications(): void {
    const currentTab = this.activeTab();
    const searchQuery = this.searchQuery().toLowerCase();
    
    const filtered = this.allApplications().filter((application) => {
      const matchesTab = currentTab === 'All' || application.requestStatus === currentTab;

      const matchesSearch = searchQuery === '' ||
        application.serviceRequest.toLowerCase().includes(searchQuery) ||
        application.referenceNumber.toLowerCase().includes(searchQuery) ||
        application.requestType.toLowerCase().includes(searchQuery);

      return matchesTab && matchesSearch;
    });

    this.filteredApplications.set(filtered);
  }

  /**
   * Count applications by status
   */
  countApplicationsByStatus(status: string): number {
    return this.allApplications().filter(
      (application) => application.requestStatus === status
    ).length;
  }

  /**
   * Refresh the applications list
   */
  refreshApplications(): void {
    this.loadServiceRequests();
  }

  /**
   * Get applicant name from owner details
   */
  getApplicantName(application: MyServiceRequest): string {
    const owner = application.ownerDetail;
    if (owner.firstName || owner.lastName) {
      return `${owner.firstName || ''} ${owner.lastName || ''}`.trim();
    } else if (!owner.isOwner) {
      return 'On Behalf';
    }
    return 'N/A';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'Draft':
        return 'bg-warning';
      case 'Pending':
        return 'bg-secondary';
      case 'Approved':
        return 'bg-success';
      case 'Rejected':
        return 'bg-error';
      default:
        return 'bg-primary';
    }
  }

  /**
   * Cancel application
   */
  cancelApplication(id: string): void {
    if (confirm('Are you sure you want to cancel this application?')) {
      // TODO: Implement cancel API call
      this.showSnackbar('Cancel functionality coming soon');
    }
  }

  /**
   * Show snackbar message
   */
  showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
