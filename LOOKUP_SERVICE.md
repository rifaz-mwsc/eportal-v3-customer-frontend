# Lookup Service - Master Data Management

## Overview
The `LookupService` provides centralized access to master data (lookup tables) used throughout the application for form dropdowns and data display. It includes intelligent caching to minimize API calls and improve performance.

## Features

✅ **Smart Caching** - Master data is cached in memory to avoid repeated API calls  
✅ **Preloading** - Data is preloaded on app initialization for authenticated users  
✅ **Type Safety** - Full TypeScript support with interfaces  
✅ **Error Handling** - Graceful error handling with fallback values  
✅ **Helper Methods** - Convenient methods to get data by ID or name  

## Available Lookups

### Premise Types
**Endpoint:** `GET /api/v1/lookup/premisetypes`

**Interface:**
```typescript
interface PremiseType {
  id: number;
  name: string;
}
```

**Available Types:**
- Residence (1)
- Guest House (2)
- Café Restaurant (3)
- Private Office (4)
- Shops And Other Businesses (5)
- Parks PublicSpace (6)
- Cemetery Mosques (7)
- Diplomatic Missions (8)
- Government Office (9)
- State Own Enterprises (SOE) (10)
- Government Schools (11)
- Public Health Facilities (13)
- Private Health Facilities (14)
- National Sports Associations (15)
- Club NGOs (16)
- Judiciary Courts (17)
- Independent Commissions (18)
- Island / Atoll / City Councils (19)
- Constructions Meters (20)

## Usage

### Basic Usage - Get All Premise Types

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { LookupService, PremiseType } from 'src/app/services/lookup.service';

@Component({...})
export class MyComponent implements OnInit {
  private lookupService = inject(LookupService);
  premiseTypes: PremiseType[] = [];

  ngOnInit() {
    this.lookupService.getPremiseTypes().subscribe(types => {
      this.premiseTypes = types;
      console.log('Premise types loaded:', types);
    });
  }
}
```

### Usage in Angular Material Dropdown

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LookupService, PremiseType } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-my-form',
  template: `
    <form [formGroup]="myForm">
      <mat-form-field>
        <mat-label>Select Premise Type</mat-label>
        <mat-select formControlName="premiseTypeId">
          <mat-option *ngFor="let type of premiseTypes" [value]="type.id">
            {{ type.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </form>
  `
})
export class MyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lookupService = inject(LookupService);

  myForm: FormGroup;
  premiseTypes: PremiseType[] = [];

  constructor() {
    this.myForm = this.fb.group({
      premiseTypeId: [null]
    });
  }

  ngOnInit() {
    this.loadPremiseTypes();
  }

  loadPremiseTypes() {
    this.lookupService.getPremiseTypes().subscribe(types => {
      this.premiseTypes = types;
    });
  }
}
```

### Get Premise Type by ID

```typescript
// Get the full premise type object
this.lookupService.getPremiseTypeById(1).subscribe(type => {
  console.log(type); // { id: 1, name: "Residence" }
});

// Get just the name
this.lookupService.getPremiseTypeName(1).subscribe(name => {
  console.log(name); // "Residence"
});
```

### Force Refresh Cache

```typescript
// Force refresh from API (bypass cache)
this.lookupService.getPremiseTypes(true).subscribe(types => {
  console.log('Fresh data from API:', types);
});
```

### Display Premise Type Name in Template

**Component:**
```typescript
export class MyComponent {
  premiseTypeId = 5;
  premiseTypeName$ = this.lookupService.getPremiseTypeName(this.premiseTypeId);
  
  constructor(private lookupService: LookupService) {}
}
```

**Template:**
```html
<div>
  Premise Type: {{ premiseTypeName$ | async }}
</div>
```

### Using with Reactive Forms and Validation

```typescript
import { Validators } from '@angular/forms';

export class MyFormComponent {
  myForm = this.fb.group({
    premiseTypeId: [null, [Validators.required]],
    address: ['', [Validators.required]]
  });

  ngOnInit() {
    this.loadPremiseTypes();
    
    // Set default value
    this.myForm.patchValue({
      premiseTypeId: 1 // Default to "Residence"
    });
    
    // Watch for changes
    this.myForm.get('premiseTypeId')?.valueChanges.subscribe(id => {
      console.log('Selected premise type ID:', id);
    });
  }
}
```

## Service Methods

### `getPremiseTypes(forceRefresh?: boolean): Observable<PremiseType[]>`
Get all premise types. Returns cached data by default.

**Parameters:**
- `forceRefresh` (optional): Set to `true` to bypass cache and fetch fresh data

**Returns:** Observable of PremiseType array

### `getPremiseTypeById(id: number): Observable<PremiseType | undefined>`
Get a single premise type by ID.

**Parameters:**
- `id`: The premise type ID

**Returns:** Observable of PremiseType or undefined if not found

### `getPremiseTypeName(id: number): Observable<string>`
Get the name of a premise type by ID.

**Parameters:**
- `id`: The premise type ID

**Returns:** Observable of string (returns "Unknown" if not found)

### `clearCache(): void`
Clear all cached lookup data. Useful when logging out or refreshing master data.

### `preloadLookupData(): void`
Preload all lookup data into cache. Called automatically on app initialization for authenticated users.

## Caching Strategy

### How It Works
1. **First Request:** Data is fetched from API and stored in memory
2. **Subsequent Requests:** Cached data is returned immediately (no API call)
3. **Manual Refresh:** Use `forceRefresh: true` to bypass cache
4. **Auto-Clear:** Cache is automatically cleared on logout

### Benefits
- ✅ Faster page loads
- ✅ Reduced server load
- ✅ Better user experience
- ✅ Offline-friendly (once cached)

### When Cache is Cleared
- User logs out
- Manual call to `clearCache()`
- App refresh/reload

## Preloading

Master data is automatically preloaded when:
- User successfully authenticates
- App initializes with valid session

**Location:** `app.component.ts`
```typescript
ngOnInit() {
  if (this.authService.isAuthenticated()) {
    this.lookupService.preloadLookupData();
  }
}
```

## Error Handling

The service includes built-in error handling:

```typescript
this.lookupService.getPremiseTypes().subscribe({
  next: (types) => {
    console.log('Success:', types);
  },
  error: (error) => {
    // Error is already logged by service
    // Returns empty array on error
    console.log('Using fallback empty array');
  }
});
```

## Adding New Lookup Endpoints

To add a new lookup endpoint:

1. **Add Interface:**
```typescript
export interface NewLookupType {
  id: number;
  name: string;
  // additional fields
}
```

2. **Add Cache Property:**
```typescript
private newLookupCache: NewLookupType[] | null = null;
```

3. **Add Getter Method:**
```typescript
getNewLookupTypes(forceRefresh: boolean = false): Observable<NewLookupType[]> {
  if (this.newLookupCache && !forceRefresh) {
    return of(this.newLookupCache);
  }

  return this.http.get<NewLookupType[]>(
    `${environment.apiBaseUrl}/api/v1/lookup/newlookup`
  ).pipe(
    tap(data => this.newLookupCache = data),
    catchError(error => {
      console.error('Error fetching new lookup:', error);
      return of([]);
    })
  );
}
```

4. **Add Helper Methods:**
```typescript
getNewLookupTypeById(id: number): Observable<NewLookupType | undefined> {
  // Similar to getPremiseTypeById
}

getNewLookupTypeName(id: number): Observable<string> {
  // Similar to getPremiseTypeName
}
```

5. **Update Preload Method:**
```typescript
preloadLookupData(): void {
  this.getPremiseTypes().subscribe();
  this.getNewLookupTypes().subscribe(); // Add new lookup
}
```

6. **Update Clear Cache:**
```typescript
clearCache(): void {
  this.premiseTypesCache = null;
  this.newLookupCache = null; // Add new lookup
}
```

## Best Practices

✅ **Use Caching:** Let the service handle caching, don't duplicate data in components  
✅ **Preload Early:** Master data is preloaded on app init for best performance  
✅ **Handle Errors:** Service handles errors gracefully, but always check for empty arrays  
✅ **Type Safety:** Use the provided TypeScript interfaces  
✅ **Avoid Force Refresh:** Only use `forceRefresh: true` when absolutely necessary  
✅ **Subscribe Properly:** Always unsubscribe or use async pipe to avoid memory leaks  

## Example: Complete Form Component

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService, PremiseType } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-premise-form',
  template: `
    <form [formGroup]="premiseForm" (ngSubmit)="onSubmit()">
      <mat-form-field class="w-100">
        <mat-label>Premise Type</mat-label>
        <mat-select formControlName="premiseTypeId" required>
          <mat-option *ngFor="let type of premiseTypes" [value]="type.id">
            {{ type.name }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="premiseForm.get('premiseTypeId')?.hasError('required')">
          Premise type is required
        </mat-error>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" 
              [disabled]="!premiseForm.valid">
        Submit
      </button>
    </form>
  `
})
export class PremiseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lookupService = inject(LookupService);

  premiseForm: FormGroup;
  premiseTypes: PremiseType[] = [];

  constructor() {
    this.premiseForm = this.fb.group({
      premiseTypeId: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.loadPremiseTypes();
  }

  loadPremiseTypes() {
    this.lookupService.getPremiseTypes().subscribe(types => {
      this.premiseTypes = types;
    });
  }

  onSubmit() {
    if (this.premiseForm.valid) {
      const selectedId = this.premiseForm.value.premiseTypeId;
      console.log('Form submitted with premise type ID:', selectedId);
      
      // Get the name for display/logging
      this.lookupService.getPremiseTypeName(selectedId).subscribe(name => {
        console.log('Selected premise type name:', name);
      });
    }
  }
}
```

## Testing

The lookup service is ready to use. Test it by:

1. Login to the application
2. Check browser console for preload confirmation
3. Use the service in any form component
4. Verify data is cached (no repeated API calls in Network tab)

---

**Service Location:** `src/app/services/lookup.service.ts`  
**Created:** March 2, 2026  
**API Base URL:** `https://e-portal-api-dev-01.mwsc.com.mv`
