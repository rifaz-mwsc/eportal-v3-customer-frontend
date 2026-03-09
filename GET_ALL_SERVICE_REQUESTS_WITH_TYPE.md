# getAllServiceRequestsWithType() - Usage Guide

## Overview

The `getAllServiceRequestsWithType()` method returns a flattened list of all service requests, each enriched with its parent request type information.

## Method Signature

```typescript
getAllServiceRequestsWithType(): Observable<ServiceRequestWithType[]>
```

## Return Type

```typescript
interface ServiceRequestWithType extends ServiceRequest {
  requestTypeId: string;        // Parent request type ID
  requestTypeName: string;       // Parent request type name (e.g., "New Connection Request")
  
  // All properties from ServiceRequest:
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

## Use Cases

### 1. Display Service Directory with Categories

Perfect for showing all services grouped by their request type:

```typescript
this.serviceRequestService.getAllServiceRequestsWithType().subscribe(services => {
  this.allServices = services;
  
  // Group by request type for display
  const grouped = services.reduce((acc, service) => {
    if (!acc[service.requestTypeName]) {
      acc[service.requestTypeName] = [];
    }
    acc[service.requestTypeName].push(service);
    return acc;
  }, {} as Record<string, ServiceRequestWithType[]>);
  
  console.log('Services by type:', grouped);
});
```

### 2. Build Navigation Menu

```typescript
this.serviceRequestService.getAllServiceRequestsWithType().subscribe(services => {
  this.menuItems = services.map(service => ({
    label: service.name,
    category: service.requestTypeName,
    route: `/services/${service.id}`,
    icon: service.isNewConnection ? 'add_circle' : 'edit'
  }));
});
```

### 3. Service Cards with Category Badges

```typescript
<mat-card *ngFor="let service of servicesWithType">
  <mat-card-header>
    <mat-card-title>{{ service.name }}</mat-card-title>
    <mat-card-subtitle>
      <mat-chip>{{ service.requestTypeName }}</mat-chip>
    </mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>Service ID: {{ service.id }}</p>
    <p>Type: {{ service.isNewConnection ? 'New Connection' : 'Change Request' }}</p>
  </mat-card-content>
</mat-card>
```

### 4. Filter Services by Request Type

```typescript
loadServicesForType(requestTypeName: string) {
  this.serviceRequestService.getAllServiceRequestsWithType()
    .pipe(
      map(services => services.filter(s => s.requestTypeName === requestTypeName))
    )
    .subscribe(filtered => {
      this.filteredServices = filtered;
    });
}
```

### 5. Search with Category Context

```typescript
searchWithCategory(term: string) {
  this.serviceRequestService.getAllServiceRequestsWithType()
    .pipe(
      map(services => services.filter(s => 
        s.name.toLowerCase().includes(term.toLowerCase()) ||
        s.requestTypeName.toLowerCase().includes(term.toLowerCase())
      ))
    )
    .subscribe(results => {
      this.searchResults = results;
    });
}
```

## Example Component

```typescript
import { Component, inject } from '@angular/core';
import { ServiceRequestService, ServiceRequestWithType } from './services/service-request.service';

@Component({
  selector: 'app-service-directory',
  template: `
    <h2>All Services</h2>
    
    <mat-list>
      <mat-list-item *ngFor="let service of services">
        <mat-icon matListItemIcon>
          {{ service.isNewConnection ? 'add_circle' : 'edit' }}
        </mat-icon>
        <div matListItemTitle>{{ service.name }}</div>
        <div matListItemLine>
          <span class="category-badge">{{ service.requestTypeName }}</span>
        </div>
        <button mat-icon-button (click)="viewDetails(service.id)">
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </mat-list-item>
    </mat-list>
  `
})
export class ServiceDirectoryComponent {
  private serviceRequestService = inject(ServiceRequestService);
  services: ServiceRequestWithType[] = [];

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.serviceRequestService.getAllServiceRequestsWithType()
      .subscribe(services => {
        this.services = services;
      });
  }

  viewDetails(serviceId: string) {
    console.log('View service:', serviceId);
    // Navigate to service details page
  }
}
```

## Data Example

Given this API response:
```json
{
  "items": [
    {
      "id": "ee25f9be-...",
      "name": "New Connection Request",
      "serviceRequests": [
        {
          "id": "939f1d94-...",
          "name": "Water New Connection",
          "isNewConnection": true
        }
      ]
    },
    {
      "id": "886f150b-...",
      "name": "Change Connection Request",
      "serviceRequests": [
        {
          "id": "671c45ea-...",
          "name": "Tariff Change Request",
          "isNewConnection": false
        }
      ]
    }
  ]
}
```

The method returns:
```typescript
[
  {
    id: "939f1d94-...",
    name: "Water New Connection",
    isNewConnection: true,
    requestTypeId: "ee25f9be-...",
    requestTypeName: "New Connection Request",
    // ... other fields
  },
  {
    id: "671c45ea-...",
    name: "Tariff Change Request",
    isNewConnection: false,
    requestTypeId: "886f150b-...",
    requestTypeName: "Change Connection Request",
    // ... other fields
  }
]
```

## Benefits

1. **Single API Call** - Get all services with category info in one request
2. **Easy Categorization** - Each service knows its parent category
3. **Simplified Filtering** - Filter by request type without nested loops
4. **Better UX** - Show category badges/labels alongside services
5. **Flexible Display** - Easy to build cards, lists, or grouped views

## Comparison with Other Methods

| Method | Returns | Use When |
|--------|---------|----------|
| `getRequestTypes()` | Nested structure with request types and their services | Building hierarchical navigation |
| `getAllServiceRequests()` | Flat list without type info | Simple service list |
| `getAllServiceRequestsWithType()` | **Flat list WITH type info** | **Service directory, cards, search results** |

## Performance

- ✅ Uses caching from `getRequestTypes()`
- ✅ Single API call (cached after first request)
- ✅ 5-minute cache duration
- ✅ Minimal memory overhead (spread operator creates shallow copies)
