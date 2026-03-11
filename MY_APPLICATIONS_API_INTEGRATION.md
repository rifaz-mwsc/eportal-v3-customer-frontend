# My Applications API Integration

## Overview
This document describes the integration of the "My Applications" API endpoint that fetches the user's service requests with pagination support.

## API Endpoint

**URL:** `GET /api/v1/servicerequests/my`

**Query Parameters:**
- `pageNumber` (number): Current page number (starts from 1)
- `pageSize` (number): Number of items per page (max: 1000, default: 100)

**Example Request:**
```
GET https://e-portal-api-dev-01.mwsc.com.mv/api/v1/servicerequests/my?pageNumber=1&pageSize=100
```

## Response Structure

### Success Response

```typescript
{
  "item": {
    "pageNumber": 1,
    "totalPages": 1,
    "pageSize": 100,
    "maxPageSize": 1000,
    "totalCount": 6,
    "hasPrevious": false,
    "hasNext": false,
    "items": [
      {
        "id": "5af46eb8-1f67-462d-9640-3adf7aa03254",
        "referenceNumber": "NCR-00007/2026",
        "requestTypeId": "ee25f9be-50e9-4d65-8fbf-79adcedb762e",
        "requestType": "New Connection Request",
        "serviceRequestId": "939f1d94-4154-402a-b963-b98fa40934f1",
        "serviceRequest": "Water New Connection",
        "requestStatus": "Draft",
        "wizardStep": 1,
        "createdOn": "2026-03-11T00:41:10.6219915",
        "modifiedOn": null,
        "createdBy": "300014@test.com",
        "modifiedBy": null,
        "ownerDetail": {
          "isOwner": true,
          "firstName": null,
          "lastName": null,
          "identificationNumber": null,
          "mobileNumber": null,
          "email": null,
          "businessPartnerCategoryId": null,
          "businessPartnerCategory": null,
          "identificationTypeId": null,
          "identificationType": null
        },
        "serviceRequiredAddress": null
      }
    ]
  },
  "isSuccessful": true,
  "statusMessage": "Success",
  "errorDetails": {}
}
```

## Interfaces

### Service Layer Interfaces

```typescript
// Owner detail information
export interface OwnerDetail {
  isOwner: boolean;
  firstName: string | null;
  lastName: string | null;
  identificationNumber: string | null;
  mobileNumber: string | null;
  email: string | null;
  businessPartnerCategoryId: string | null;
  businessPartnerCategory: string | null;
  identificationTypeId: string | null;
  identificationType: string | null;
}

// Service required address (structure to be defined)
export interface ServiceRequiredAddress {
  [key: string]: any;
}

// Individual service request item
export interface MyServiceRequest {
  id: string;
  referenceNumber: string;
  requestTypeId: string;
  requestType: string;
  serviceRequestId: string;
  serviceRequest: string;
  requestStatus: string;
  wizardStep: number;
  createdOn: string;
  modifiedOn: string | null;
  createdBy: string;
  modifiedBy: string | null;
  ownerDetail: OwnerDetail;
  serviceRequiredAddress: ServiceRequiredAddress | null;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  maxPageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: T[];
}

// API response wrapper
export interface MyServiceRequestsResponse {
  item: PaginatedResponse<MyServiceRequest>;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: any };
}
```

## Implementation Details

### Service Method

**File:** `src/app/services/service-request.service.ts`

```typescript
getMyServiceRequests(pageNumber: number = 1, pageSize: number = 100): Observable<MyServiceRequestsResponse> {
  const params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());

  return this.http.get<MyServiceRequestsResponse>(`${this.BASE_URL}/my`, { params }).pipe(
    tap(response => {
      if (response.isSuccessful) {
        console.log('My service requests fetched successfully');
      }
    }),
    catchError(error => {
      // Returns formatted error response with empty items array
    })
  );
}
```

### Component Integration

**File:** `src/app/pages/apps/my-applications/application-list/application-list.component.ts`

#### Key Changes:

1. **Added Properties:**
   - `isLoading` - Loading state indicator
   - `totalCount` - Total number of applications from API
   - `pageNumber` - Current page number
   - `pageSize` - Items per page

2. **API Call Method:**
   ```typescript
   loadServiceRequests(): void {
     this.isLoading.set(true);
     this.serviceRequestService.getMyServiceRequests(this.pageNumber(), this.pageSize())
       .subscribe({
         next: (response) => {
           // Maps API response to Application interface
           // Updates table data source
         },
         error: (error) => {
           // Shows error message
         }
       });
   }
   ```

3. **Data Mapping:**
   ```typescript
   private mapServiceRequestToApplication(request: MyServiceRequest): Application {
     // Extracts applicant name from owner details
     // Converts UUID to display ID
     // Maps API fields to Application interface
     // Stores additional fields for future use
   }
   ```

4. **Pagination Support:**
   - Listens to paginator page events
   - Triggers API call on page change
   - Updates paginator length with total count

5. **Refresh Functionality:**
   ```typescript
   refreshApplications(): void {
     this.loadServiceRequests();
   }
   ```

### Template Changes

**File:** `application-list.component.html`

1. **Loading Indicator:**
   ```html
   @if (isLoading()) {
     <div class="d-flex justify-content-center align-items-center p-y-24">
       <mat-spinner diameter="40"></mat-spinner>
       <span class="m-l-16">Loading applications...</span>
     </div>
   } @else {
     <!-- Table content -->
   }
   ```

2. **Updated Status Tabs:**
   - Changed "Pending" to "Draft" (first tab)
   - Reflects actual API response statuses

3. **Server-Side Pagination:**
   ```html
   <mat-paginator 
     [length]="totalCount()" 
     [pageSize]="pageSize()" 
     [pageSizeOptions]="[10, 25, 50, 100]" 
     showFirstLastButtons>
   </mat-paginator>
   ```

4. **Refresh Button:**
   ```html
   <button mat-icon-button (click)="refreshApplications()" [disabled]="isLoading()">
     <i-tabler name="refresh"></i-tabler>
   </button>
   ```

## Data Flow

1. **Component Initialization:**
   - `ngOnInit()` → `loadServiceRequests()`
   - Sets `isLoading = true`

2. **API Call:**
   - Sends GET request with `pageNumber` and `pageSize`
   - Receives paginated response

3. **Data Transformation:**
   - Maps `MyServiceRequest[]` to `Application[]`
   - Handles null/undefined values
   - Stores original UUID for future operations

4. **UI Update:**
   - Updates `applicationList` data source
   - Sets `isLoading = false`
   - Shows success/error messages

5. **User Interactions:**
   - **Pagination:** Triggers new API call with updated page
   - **Filter:** Client-side filtering on loaded data
   - **Tab Selection:** Client-side filtering by status
   - **Refresh:** Reloads current page from API

## Status Mapping

API provides the following statuses:
- `Draft` - Application saved but not submitted
- `Pending` - Application submitted, awaiting review
- `Approved` - Application approved
- (Other statuses as defined by backend)

## Error Handling

### Network Errors
- Caught by `catchError` operator
- Returns formatted response with empty items array
- Shows snackbar: "Error loading applications. Please try again."

### API Errors
- Checks `response.isSuccessful`
- Shows snackbar with `statusMessage`
- Logs error details to console

## Console Logging

The implementation includes comprehensive logging:
- Request parameters (pageNumber, pageSize)
- Success: Total count, page info, items count
- Errors: Full error object and status message

## Future Enhancements

1. **Delete Functionality:**
   - Currently uses mock service
   - Should integrate with DELETE API endpoint

2. **Edit/Resume Application:**
   - Use `wizardStep` to resume at correct step
   - Navigate with `actualId` (UUID)

3. **ServiceRequiredAddress:**
   - Define interface structure when available
   - Display address in table/detail view

4. **Advanced Filtering:**
   - Date range filters
   - Service type filters
   - Multi-status selection

5. **Export Functionality:**
   - CSV/PDF export of applications list

6. **Real-time Updates:**
   - WebSocket/polling for status changes
   - Notifications for status updates

## Testing Checklist

- [ ] Applications load on page init
- [ ] Loading spinner shows during API call
- [ ] Table displays correct data
- [ ] Pagination works (page change triggers API call)
- [ ] Page size change works
- [ ] Total count displays correctly
- [ ] Status tabs filter correctly (client-side)
- [ ] Search filter works
- [ ] Refresh button reloads data
- [ ] Error handling shows appropriate messages
- [ ] Empty state displays when no applications
- [ ] Reference numbers display correctly
- [ ] Dates format correctly
- [ ] Status badges show correct colors
- [ ] Navigate to application detail works
- [ ] Console logs show request/response details

## Known Issues

1. **grandTotal always 0:** API doesn't provide cost information
2. **Delete uses mock data:** Needs real DELETE API integration
3. **serviceRequiredAddress is null:** Structure not yet defined

## Related Files

- `src/app/services/service-request.service.ts` - API service
- `src/app/pages/apps/my-applications/application-list/application-list.component.ts` - Component
- `src/app/pages/apps/my-applications/application-list/application-list.component.html` - Template
- `src/app/pages/apps/my-applications/application.ts` - Application interface
