import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { 
  ServiceRequestService, 
  RequestType, 
  ServiceRequest,
  ServiceRequestWithType,
  RequestPipelineGuideline,
  RequestPipelineStep
} from '../services/service-request.service';

/**
 * Example component showing how to use the ServiceRequestService
 * This demonstrates various ways to fetch and display service request data
 */
@Component({
  selector: 'app-service-requests-example',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="container">
      <h2>Service Requests Example</h2>

      <!-- Example 1: Get All Request Types -->
      <mat-card class="mb-3">
        <mat-card-header>
          <mat-card-title>All Request Types</mat-card-title>
          <button mat-raised-button color="primary" (click)="loadRequestTypes()">
            Load Request Types
          </button>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="requestTypes.length > 0">
            <mat-accordion>
              <mat-expansion-panel *ngFor="let requestType of requestTypes">
                <mat-expansion-panel-header>
                  <mat-panel-title>{{ requestType.name }}</mat-panel-title>
                  <mat-panel-description>
                    {{ requestType.serviceRequests.length }} service(s)
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <mat-list>
                  <mat-list-item *ngFor="let service of requestType.serviceRequests">
                    <mat-icon matListItemIcon>{{ service.isNewConnection ? 'add_circle' : 'edit' }}</mat-icon>
                    <div matListItemTitle>{{ service.name }}</div>
                    <div matListItemLine>
                      <mat-chip-set>
                        <mat-chip *ngIf="service.isNewConnection">New Connection</mat-chip>
                        <mat-chip *ngIf="service.requiresOwnerDetails">Owner Details</mat-chip>
                        <mat-chip *ngIf="service.requiresDocuments">Documents</mat-chip>
                      </mat-chip-set>
                    </div>
                  </mat-list-item>
                </mat-list>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Example 2: New Connection Requests Only -->
      <mat-card class="mb-3">
        <mat-card-header>
          <mat-card-title>New Connection Requests</mat-card-title>
          <button mat-raised-button color="accent" (click)="loadNewConnections()">
            Load New Connections
          </button>
        </mat-card-header>
        <mat-card-content>
          <mat-list *ngIf="newConnections.length > 0">
            <mat-list-item *ngFor="let service of newConnections">
              <mat-icon matListItemIcon>add_circle</mat-icon>
              <div matListItemTitle>{{ service.name }}</div>
              <div matListItemLine>{{ service.requestPipelineSteps.length }} steps</div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <!-- Example 2.5: All Service Requests with Type Info -->
      <mat-card class="mb-3">
        <mat-card-header>
          <mat-card-title>All Service Requests (with UI Properties)</mat-card-title>
          <button mat-raised-button color="primary" (click)="loadAllServicesWithType()">
            Load All with Type
          </button>
        </mat-card-header>
        <mat-card-content>
          <mat-list *ngIf="servicesWithType.length > 0">
            <mat-list-item *ngFor="let service of servicesWithType">
              <div matListItemIcon 
                   [class]="'icon-bg ' + service.bg_color" 
                   style="width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <mat-icon [class]="service.color">{{ service.icon }}</mat-icon>
              </div>
              <div matListItemTitle>{{ service.name }}</div>
              <div matListItemLine>
                <span class="text-muted">{{ service.requestTypeName }}</span>
                <span style="margin-left: 8px;">
                  <mat-chip size="small" [color]="service.bg_color">
                    {{ service.isNewConnection ? 'New' : 'Change' }}
                  </mat-chip>
                </span>
              </div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <!-- Example 3: Service Request Details -->
      <mat-card class="mb-3">
        <mat-card-header>
          <mat-card-title>Service Request Details</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="selectedService">
            <h3>{{ selectedService.name }}</h3>
            
            <!-- Guidelines -->
            <div *ngIf="guidelines.length > 0" class="mb-3">
              <h4>Guidelines</h4>
              <mat-stepper orientation="vertical" linear="false">
                <mat-step *ngFor="let guideline of guidelines" [label]="guideline.title">
                  <h5>{{ guideline.subTitle }}</h5>
                  <div [innerHTML]="guideline.content"></div>
                </mat-step>
              </mat-stepper>
            </div>

            <!-- Pipeline Steps -->
            <div *ngIf="pipelineSteps.length > 0" class="mb-3">
              <h4>Application Steps</h4>
              <mat-stepper orientation="vertical" linear="false">
                <mat-step *ngFor="let step of pipelineSteps" [label]="step.title">
                  <p>{{ step.description }}</p>
                  <mat-chip-set>
                    <mat-chip>{{ step.pipelineStepType }}</mat-chip>
                    <mat-chip *ngIf="step.isRequired" color="warn">Required</mat-chip>
                  </mat-chip-set>
                  
                  <!-- Documents for this step -->
                  <div *ngIf="step.requestPipelineStepDocuments.length > 0" class="mt-2">
                    <p><strong>Required Documents:</strong></p>
                    <ul>
                      <li *ngFor="let doc of step.requestPipelineStepDocuments">
                        {{ doc.documentType }}
                        <mat-chip *ngIf="doc.isRequired" size="small" color="warn">Required</mat-chip>
                      </li>
                    </ul>
                  </div>

                  <!-- Declaration content -->
                  <div *ngIf="step.declarationContent" class="declaration-content mt-2">
                    <div [innerHTML]="step.declarationContent"></div>
                  </div>
                </mat-step>
              </mat-stepper>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .mb-3 {
      margin-bottom: 1rem;
    }

    .mt-2 {
      margin-top: 0.5rem;
    }

    .icon-bg {
      background-color: var(--mat-sys-surface-variant);
    }

    .icon-bg.error {
      background-color: var(--mat-sys-error-container, #ffebee);
    }

    .icon-bg.primary {
      background-color: var(--mat-sys-primary-container, #e3f2fd);
    }

    .icon-bg.secondary {
      background-color: var(--mat-sys-secondary-container, #f3e5f5);
    }

    .text-muted {
      color: var(--mat-sys-on-surface-variant);
    }

    .declaration-content {
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      max-height: 400px;
      overflow-y: auto;
    }
  `]
})
export class ServiceRequestsExampleComponent implements OnInit {
  private serviceRequestService = inject(ServiceRequestService);

  requestTypes: RequestType[] = [];
  newConnections: ServiceRequest[] = [];
  servicesWithType: ServiceRequestWithType[] = [];
  selectedService: ServiceRequest | null = null;
  guidelines: RequestPipelineGuideline[] = [];
  pipelineSteps: RequestPipelineStep[] = [];

  ngOnInit() {
    // Optionally load data on init
    // this.loadRequestTypes();
  }

  /**
   * Load all request types
   */
  loadRequestTypes() {
    this.serviceRequestService.getRequestTypes('', 1, 100).subscribe(response => {
      this.requestTypes = response.items;
      console.log('Loaded request types:', this.requestTypes);
      
      // Optionally select the first service for details
      if (this.requestTypes.length > 0 && this.requestTypes[0].serviceRequests.length > 0) {
        this.loadServiceDetails(this.requestTypes[0].serviceRequests[0].id);
      }
    });
  }

  /**
   * Load new connection requests only
   */
  loadNewConnections() {
    this.serviceRequestService.getNewConnectionRequests().subscribe(services => {
      this.newConnections = services;
      console.log('Loaded new connections:', this.newConnections);
    });
  }

  /**
   * Load all service requests with their request type information
   */
  loadAllServicesWithType() {
    this.serviceRequestService.getAllServiceRequestsWithType().subscribe(services => {
      this.servicesWithType = services;
      console.log('Loaded services with type:', this.servicesWithType);
    });
  }

  /**
   * Load details for a specific service request
   */
  loadServiceDetails(serviceRequestId: string) {
    // Get the service request
    this.serviceRequestService.getServiceRequestById(serviceRequestId).subscribe(service => {
      this.selectedService = service;
      console.log('Selected service:', this.selectedService);
    });

    // Get guidelines
    this.serviceRequestService.getPipelineGuidelines(serviceRequestId).subscribe(guidelines => {
      this.guidelines = guidelines;
      console.log('Guidelines:', this.guidelines);
    });

    // Get pipeline steps
    this.serviceRequestService.getPipelineSteps(serviceRequestId).subscribe(steps => {
      this.pipelineSteps = steps;
      console.log('Pipeline steps:', this.pipelineSteps);
    });
  }

  /**
   * Search service requests
   */
  searchServices(searchTerm: string) {
    this.serviceRequestService.searchServiceRequests(searchTerm).subscribe(services => {
      console.log('Search results:', services);
    });
  }
}
