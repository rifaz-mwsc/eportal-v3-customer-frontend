# Service Request UI Properties

## Overview

The `ServiceRequestWithType` interface now includes UI styling properties that are automatically assigned based on service characteristics.

## Added Properties

```typescript
export interface ServiceRequestWithType extends ServiceRequest {
  requestTypeId: string;
  requestTypeName: string;
  bg_color: string;    // Background color theme
  icon: string;        // Icon name (Tabler icons)
  color: string;       // Text color class
}
```

## UI Property Assignment Logic

### New Connection Services

#### Water-related Services
- **bg_color**: `'error'`
- **icon**: `'chart-bubble'`
- **color**: `'text-error'`

**Example:** "Water New Connection"

#### Sewerage-related Services
- **bg_color**: `'primary'`
- **icon**: `'building-store'`
- **color**: `'text-primary'`

**Example:** "Sewerage New Connection"

#### Default New Connection
- **bg_color**: `'error'`
- **icon**: `'chart-bubble'`
- **color**: `'text-error'`

---

### Change/Modification Services

#### Tariff/Billing Services
- **bg_color**: `'secondary'`
- **icon**: `'category-2'`
- **color**: `'text-secondary'`

**Example:** "Tariff Change Request"

#### Ownership/Transfer Services
- **bg_color**: `'--mat-sys-outline-variant'`
- **icon**: `'activity-heartbeat'`
- **color**: `'text-dark'`

**Example:** "Ownership Change Request"

#### Repair/Maintenance Services
- **bg_color**: `'error'`
- **icon**: `'chart-bubble'`
- **color**: `'text-error'`

**Example:** "Repair Request"

#### Default Change Request
- **bg_color**: `'secondary'`
- **icon**: `'category-2'`
- **color**: `'text-secondary'`

---

## Usage in Templates

### Basic Card with Icon

```html
<mat-card *ngFor="let service of services">
  <mat-card-header>
    <div mat-card-avatar 
         [class]="'icon-container ' + service.bg_color">
      <mat-icon [class]="service.color">
        {{ service.icon }}
      </mat-icon>
    </div>
    <mat-card-title>{{ service.name }}</mat-card-title>
    <mat-card-subtitle>{{ service.requestTypeName }}</mat-card-subtitle>
  </mat-card-header>
</mat-card>
```

### List with Colored Icons

```html
<mat-list>
  <mat-list-item *ngFor="let service of services">
    <div matListItemIcon 
         [class]="'icon-bg ' + service.bg_color"
         style="width: 48px; height: 48px; border-radius: 8px; 
                display: flex; align-items: center; justify-content: center;">
      <mat-icon [class]="service.color">{{ service.icon }}</mat-icon>
    </div>
    <div matListItemTitle>{{ service.name }}</div>
    <div matListItemLine>{{ service.requestTypeName }}</div>
  </mat-list-item>
</mat-list>
```

### Required CSS Classes

```css
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

.text-error {
  color: var(--mat-sys-error, #d32f2f);
}

.text-primary {
  color: var(--mat-sys-primary, #1976d2);
}

.text-secondary {
  color: var(--mat-sys-secondary, #9c27b0);
}

.text-dark {
  color: var(--mat-sys-on-surface, #000000de);
}
```

## Component Example

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { ServiceRequestService, ServiceRequestWithType } from './services/service-request.service';

@Component({
  selector: 'app-service-directory',
  template: `
    <div class="service-grid">
      <mat-card *ngFor="let service of services" class="service-card">
        <div class="service-icon" [class]="service.bg_color">
          <mat-icon [class]="service.color">{{ service.icon }}</mat-icon>
        </div>
        <h3>{{ service.name }}</h3>
        <p class="category">{{ service.requestTypeName }}</p>
        <mat-chip [color]="service.bg_color">
          {{ service.isNewConnection ? 'New Connection' : 'Change Request' }}
        </mat-chip>
      </mat-card>
    </div>
  `,
  styles: [`
    .service-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      padding: 16px;
    }

    .service-card {
      padding: 24px;
      text-align: center;
    }

    .service-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .service-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .category {
      color: var(--mat-sys-on-surface-variant);
      font-size: 14px;
      margin: 8px 0;
    }
  `]
})
export class ServiceDirectoryComponent implements OnInit {
  private serviceRequestService = inject(ServiceRequestService);
  services: ServiceRequestWithType[] = [];

  ngOnInit() {
    this.serviceRequestService.getAllServiceRequestsWithType()
      .subscribe(services => {
        this.services = services;
        console.log('Services with UI properties:', services);
      });
  }
}
```

## Available Icons (Tabler Icons)

- `chart-bubble` - Analytics/water flow
- `building-store` - Buildings/facilities
- `category-2` - Categories/organization
- `activity-heartbeat` - Activity/monitoring

You can customize the icon mapping by modifying the `getServiceUIProperties()` method in `service-request.service.ts`.

## Color Themes

| Theme | Use Case | Background | Text Color |
|-------|----------|------------|------------|
| `error` | Critical/urgent services | Red tint | Red |
| `primary` | Main services | Blue tint | Blue |
| `secondary` | Supporting services | Purple tint | Purple |
| `outline-variant` | Neutral services | Gray tint | Dark |

## Customization

To customize the UI property assignment logic, edit the `getServiceUIProperties()` method in `service-request.service.ts`:

```typescript
private getServiceUIProperties(serviceRequest: ServiceRequest, requestTypeName: string) {
  // Add your custom logic here
  if (serviceRequest.name.toLowerCase().includes('your-keyword')) {
    return {
      bg_color: 'primary',
      icon: 'your-icon',
      color: 'text-primary'
    };
  }
  
  // ... existing logic
}
```
