# Lookup Service API Documentation

This document describes how to use the Lookup Service to fetch master data from the API.

## Available Endpoints

### 1. Divisions
```typescript
import { LookupService, Division } from 'src/app/services/lookup.service';

// Get all divisions
this.lookupService.getDivisions().subscribe(divisions => {
  console.log(divisions);
  // [
  //   { id: 1, name: "Water Division" },
  //   { id: 2, name: "Electricity Division" },
  //   { id: 3, name: "Sewerage Division" },
  //   { id: 4, name: "Waste Division" }
  // ]
});

// Get division by ID
this.lookupService.getDivisionById(1).subscribe(division => {
  console.log(division?.name); // "Water Division"
});
```

### 2. Business Categories
```typescript
// Get all business categories
this.lookupService.getBusinessCategories().subscribe(categories => {
  console.log(categories);
  // [
  //   { id: "31f756d2-64e6-484c-a615-a929467903ec", name: "Organization" },
  //   { id: "83ef57a9-0f07-4718-ad65-f8645b505142", name: "Person" }
  // ]
});

// Get category by ID
this.lookupService.getBusinessCategoryById('31f756d2-64e6-484c-a615-a929467903ec')
  .subscribe(category => {
    console.log(category?.name); // "Organization"
  });
```

### 3. Tariff Groups
```typescript
// Get all tariff groups
this.lookupService.getTariffGroups().subscribe(groups => {
  console.log(groups);
  // [
  //   { id: 1, name: "Domestic" },
  //   { id: 2, name: "Commercial" },
  //   { id: 3, name: "Institutional" },
  //   { id: 4, name: "Industrial" },
  //   { id: 5, name: "Kiosk" }
  // ]
});

// Get tariff group by ID
this.lookupService.getTariffGroupById(1).subscribe(group => {
  console.log(group?.name); // "Domestic"
});
```

### 4. Floors
```typescript
// Get all floors
this.lookupService.getFloors().subscribe(floors => {
  console.log(floors);
  // [
  //   { id: 1, number: 1 },
  //   { id: 2, number: 2 },
  //   ...
  //   { id: 10, number: 10 }
  // ]
});

// Get floor by ID
this.lookupService.getFloorById(5).subscribe(floor => {
  console.log(floor?.number); // 5
});
```

### 5. Identification Types
```typescript
// Get all identification types
this.lookupService.getIdentificationTypes().subscribe(types => {
  console.log(types);
  // [
  //   { id: "18af60c8-df22-406c-a8e9-31d24741ac1c", name: "Identification No" },
  //   { id: "cc1fa214-ff9a-4e36-af74-6e2c4f769f69", name: "Passport" },
  //   { id: "c5c22f19-7745-4b95-b00e-e222092e0304", name: "Company Registration No" },
  //   { id: "0c37b907-79e8-4636-b5c6-f6d31f95c0bb", name: "Tax Identification No" }
  // ]
});

// Get identification type by ID
this.lookupService.getIdentificationTypeById('18af60c8-df22-406c-a8e9-31d24741ac1c')
  .subscribe(type => {
    console.log(type?.name); // "Identification No"
  });
```

## Component Usage Example

```typescript
import { Component, OnInit } from '@angular/core';
import { LookupService, Division, TariffGroup } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-example',
  template: `
    <mat-form-field>
      <mat-label>Select Division</mat-label>
      <mat-select [(ngModel)]="selectedDivision">
        @for(division of divisions; track division.id) {
          <mat-option [value]="division.id">{{ division.name }}</mat-option>
        }
      </mat-select>
    </mat-form-field>

    <mat-form-field>
      <mat-label>Select Tariff Group</mat-label>
      <mat-select [(ngModel)]="selectedTariffGroup">
        @for(group of tariffGroups; track group.id) {
          <mat-option [value]="group.id">{{ group.name }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `
})
export class ExampleComponent implements OnInit {
  divisions: Division[] = [];
  tariffGroups: TariffGroup[] = [];
  selectedDivision: number | null = null;
  selectedTariffGroup: number | null = null;

  constructor(private lookupService: LookupService) {}

  ngOnInit(): void {
    // Load divisions
    this.lookupService.getDivisions().subscribe(divisions => {
      this.divisions = divisions;
    });

    // Load tariff groups
    this.lookupService.getTariffGroups().subscribe(groups => {
      this.tariffGroups = groups;
    });
  }
}
```

## Caching

All lookup endpoints are **automatically cached** after the first call. This means:
- First call fetches from API
- Subsequent calls return cached data (no API call)
- Cache persists until page refresh or manual clear

### Clear Cache
```typescript
// Clear all lookup caches
this.lookupService.clearCache();

// Or refresh specific lookups
this.lookupService.refreshDivisions().subscribe(divisions => {
  console.log('Fresh divisions:', divisions);
});

this.lookupService.refreshTariffGroups().subscribe(groups => {
  console.log('Fresh tariff groups:', groups);
});
```

## Preloading

You can preload all lookup data on app initialization:

```typescript
// In app.component.ts or app initializer
export class AppComponent implements OnInit {
  constructor(private lookupService: LookupService) {}

  ngOnInit(): void {
    // Preload all lookup data
    this.lookupService.preloadLookupData();
  }
}
```

## Error Handling

All lookup methods include error handling that returns empty arrays on failure:

```typescript
this.lookupService.getDivisions().subscribe(divisions => {
  if (divisions.length === 0) {
    console.warn('No divisions available or error occurred');
  }
});
```

## TypeScript Interfaces

All response types are strongly typed:

```typescript
interface Division {
  id: number;
  name: string;
}

interface BusinessCategory {
  id: string;
  name: string;
}

interface TariffGroup {
  id: number;
  name: string;
}

interface Floor {
  id: number;
  number: number;
}

interface IdentificationType {
  id: string;
  name: string;
}
```
