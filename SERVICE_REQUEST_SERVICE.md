# Service Request Service

## Overview

The `ServiceRequestService` manages all application request-related endpoints for the ePortal application. It provides methods to fetch, cache, and manage service request types, pipeline steps, guidelines, and required documents.

## Features

- ✅ Fetch paginated request types with search
- ✅ Caching mechanism (5-minute cache duration)
- ✅ Get specific request types and service requests by ID
- ✅ Filter new connection vs change connection requests
- ✅ Search service requests by name
- ✅ Get pipeline steps, guidelines, and required documents
- ✅ Preload data on app initialization

## Installation

The service is automatically available via dependency injection. No additional setup required.

## Usage

### Basic Import

```typescript
import { ServiceRequestService } from './services/service-request.service';
```

### Inject in Component

```typescript
export class MyComponent {
  private serviceRequestService = inject(ServiceRequestService);
  // or
  constructor(private serviceRequestService: ServiceRequestService) {}
}
```

## API Methods

### 1. Get Request Types (with pagination)

```typescript
getRequestTypes(
  searchValue: string = '',
  pageNumber: number = 1,
  pageSize: number = 100,
  forceRefresh: boolean = false
): Observable<PaginatedResponse<RequestType>>
```

**Example:**
```typescript
this.serviceRequestService.getRequestTypes('', 1, 100).subscribe(response => {
  console.log('Total items:', response.totalCount);
  console.log('Items:', response.items);
});
```

### 2. Get Request Type by ID

```typescript
getRequestTypeById(requestTypeId: string): Observable<RequestType | null>
```

**Example:**
```typescript
this.serviceRequestService.getRequestTypeById('ee25f9be-50e9-4d65-8fbf-79adcedb762e')
  .subscribe(requestType => {
    console.log('Request Type:', requestType?.name);
  });
```

### 3. Get Service Request by ID

```typescript
getServiceRequestById(serviceRequestId: string): Observable<ServiceRequest | null>
```

**Example:**
```typescript
this.serviceRequestService.getServiceRequestById('939f1d94-4154-402a-b963-b98fa40934f1')
  .subscribe(service => {
    console.log('Service:', service?.name);
    console.log('Is New Connection:', service?.isNewConnection);
  });
```

### 4. Get All Service Requests (Flattened)

```typescript
getAllServiceRequests(): Observable<ServiceRequest[]>
```

**Example:**
```typescript
this.serviceRequestService.getAllServiceRequests().subscribe(services => {
  console.log('Total services:', services.length);
});
```

### 5. Get New Connection Requests Only

```typescript
getNewConnectionRequests(): Observable<ServiceRequest[]>
```

**Example:**
```typescript
this.serviceRequestService.getNewConnectionRequests().subscribe(services => {
  services.forEach(service => {
    console.log('New Connection:', service.name);
  });
});
```

### 6. Get Change Connection Requests Only

```typescript
getChangeConnectionRequests(): Observable<ServiceRequest[]>
```

**Example:**
```typescript
this.serviceRequestService.getChangeConnectionRequests().subscribe(services => {
  services.forEach(service => {
    console.log('Change Request:', service.name);
  });
});
```

### 7. Search Service Requests

```typescript
searchServiceRequests(searchTerm: string): Observable<ServiceRequest[]>
```

**Example:**
```typescript
this.serviceRequestService.searchServiceRequests('water').subscribe(services => {
  console.log('Matching services:', services);
});
```

### 8. Get Pipeline Steps

```typescript
getPipelineSteps(serviceRequestId: string): Observable<RequestPipelineStep[]>
```

**Example:**
```typescript
this.serviceRequestService.getPipelineSteps('939f1d94-4154-402a-b963-b98fa40934f1')
  .subscribe(steps => {
    steps.forEach(step => {
      console.log(`Step ${step.stepOrder}: ${step.title}`);
      console.log('Type:', step.pipelineStepType);
      console.log('Required:', step.isRequired);
    });
  });
```

### 9. Get Pipeline Guidelines

```typescript
getPipelineGuidelines(serviceRequestId: string): Observable<RequestPipelineGuideline[]>
```

**Example:**
```typescript
this.serviceRequestService.getPipelineGuidelines('939f1d94-4154-402a-b963-b98fa40934f1')
  .subscribe(guidelines => {
    guidelines.forEach(guideline => {
      console.log(guideline.title);
      console.log(guideline.subTitle);
      // guideline.content contains HTML
    });
  });
```

### 10. Get Required Documents

```typescript
getRequiredDocuments(serviceRequestId: string): Observable<RequestPipelineStepDocument[]>
```

**Example:**
```typescript
this.serviceRequestService.getRequiredDocuments('939f1d94-4154-402a-b963-b98fa40934f1')
  .subscribe(documents => {
    documents.forEach(doc => {
      console.log('Document:', doc.documentType);
      console.log('Required:', doc.isRequired);
    });
  });
```

### 11. Get Declaration Content

```typescript
getDeclarationContent(serviceRequestId: string): Observable<string | null>
```

**Example:**
```typescript
this.serviceRequestService.getDeclarationContent('939f1d94-4154-402a-b963-b98fa40934f1')
  .subscribe(content => {
    if (content) {
      // content is HTML string
      this.declarationHtml = content;
    }
  });
```

### 12. Preload Request Types

```typescript
preloadRequestTypes(): Observable<void>
```

**Example (in app.component.ts):**
```typescript
ngOnInit() {
  if (this.authService.isAuthenticated()) {
    this.serviceRequestService.preloadRequestTypes().subscribe();
  }
}
```

### 13. Clear Cache

```typescript
clearCache(): void
```

**Example:**
```typescript
// Clear cache when user logs out
logout() {
  this.serviceRequestService.clearCache();
  this.authService.logout();
}
```

## Data Structures

### RequestType
```typescript
interface RequestType {
  id: string;
  name: string;
  serviceRequests: ServiceRequest[];
}
```

### ServiceRequest
```typescript
interface ServiceRequest {
  id: string;
  name: string;
  isNewConnection: boolean;
  requiresOwnerDetails: boolean;
  requiresConnectionDetails: boolean;
  requiresServiceAddress: boolean;
  requiresDocuments: boolean;
  requestPipelineGuidelines: RequestPipelineGuideline[];
  requestPipelineSteps: RequestPipelineStep[];
}
```

### RequestPipelineStep
```typescript
interface RequestPipelineStep {
  stepKey: string;
  title: string;
  description: string;
  stepOrder: number;
  isRequired: boolean;
  pipelineStepType: 'FormSection' | 'DocumentUpload' | 'Declaration';
  declarationContent: string | null;
  requestPipelineStepDocuments: RequestPipelineStepDocument[];
}
```

### RequestPipelineGuideline
```typescript
interface RequestPipelineGuideline {
  title: string;
  subTitle: string;
  content: string; // HTML content
  stepOrder: number;
}
```

### RequestPipelineStepDocument
```typescript
interface RequestPipelineStepDocument {
  requestPipelineStepId: string;
  requestPipelineStep: string;
  documentTypeId: string;
  documentType: string;
  isRequired: boolean;
  displayOrder: number;
}
```

### PaginatedResponse
```typescript
interface PaginatedResponse<T> {
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  maxPageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: T[];
}
```

## Caching Strategy

- Cache duration: **5 minutes**
- Cached data: Full list of request types (when fetching page 1 without search)
- Cache is automatically bypassed when:
  - Using search filters
  - Requesting pages beyond page 1
  - Using `forceRefresh: true`

## Pipeline Step Types

1. **FormSection** - Form input step (e.g., Owner Details, Service Address)
2. **DocumentUpload** - File upload step with required documents
3. **Declaration** - Terms and conditions acceptance step

## Common Patterns

### Display Service Request with Guidelines

```typescript
loadServiceWithGuidelines(serviceId: string) {
  combineLatest([
    this.serviceRequestService.getServiceRequestById(serviceId),
    this.serviceRequestService.getPipelineGuidelines(serviceId)
  ]).subscribe(([service, guidelines]) => {
    this.service = service;
    this.guidelines = guidelines;
  });
}
```

### Build Application Wizard

```typescript
buildApplicationWizard(serviceId: string) {
  this.serviceRequestService.getPipelineSteps(serviceId)
    .subscribe(steps => {
      this.wizardSteps = steps.map(step => ({
        label: step.title,
        description: step.description,
        type: step.pipelineStepType,
        required: step.isRequired,
        documents: step.requestPipelineStepDocuments
      }));
    });
}
```

### Filter and Display

```typescript
// Show only services that require documents
this.serviceRequestService.getAllServiceRequests()
  .pipe(
    map(services => services.filter(s => s.requiresDocuments))
  )
  .subscribe(services => {
    this.servicesRequiringDocuments = services;
  });
```

## Error Handling

The service handles errors gracefully and returns empty results on failure:

```typescript
this.serviceRequestService.getRequestTypes().subscribe(response => {
  if (response.items.length === 0) {
    console.log('No data or error occurred');
  }
});
```

## Integration with App Initialization

Add to `app.component.ts` to preload data:

```typescript
ngOnInit() {
  const authService = inject(AuthService);
  const serviceRequestService = inject(ServiceRequestService);
  
  if (authService.isAuthenticated()) {
    // Preload in parallel
    forkJoin([
      lookupService.preloadLookupData(),
      serviceRequestService.preloadRequestTypes()
    ]).subscribe(() => {
      console.log('All data preloaded');
    });
  }
}
```

## Notes

- All HTML content (guidelines, declarations) should be sanitized before rendering
- Documents are sorted by `displayOrder`
- Steps are sorted by `stepOrder`
- Service uses Angular's `HttpClient` and requires authentication headers from the auth interceptor
