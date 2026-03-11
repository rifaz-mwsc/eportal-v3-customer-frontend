# Step 2 - Service Address API Integration

## Overview
This document describes the integration of Step 2 (Service Address) API endpoint for the service request application workflow.

## API Endpoint

**URL:** `POST /api/v1/servicerequests/step2`

**Request Body:**
```typescript
{
  serviceRequestId: string;
  addressLine1: string;          // Required
  addressLine2?: string;          // Optional
  road?: string;                  // Optional
  houseNumber?: string;           // Optional
  islandId: number;               // Required
  postalCode?: string;            // Optional
}
```

**Example Request:**
```json
{
  "serviceRequestId": "939f1d94-4154-402a-b963-b98fa40934f1",
  "addressLine1": "Test Building",
  "addressLine2": "Main Street",
  "road": "Main Street",
  "houseNumber": "12A",
  "islandId": 1,
  "postalCode": "20000"
}
```

## Response Structure

### Success Response (200)

```json
{
  "item": true,
  "isSuccessful": true,
  "statusMessage": "success",
  "errorDetails": {}
}
```

### Error Response (400)

```json
{
  "item": false,
  "isSuccessful": false,
  "statusMessage": "Unable to create service required location.",
  "errorDetails": {
    "islandId": [
      "Invalid island."
    ]
  }
}
```

## TypeScript Interfaces

### Service Layer Interfaces

```typescript
// Request interface for Step 2
export interface Step2ServiceAddressRequest {
  serviceRequestId: string;
  addressLine1: string;
  addressLine2?: string;
  road?: string;
  houseNumber?: string;
  islandId: number;
  postalCode?: string;
}

// Response interface
export interface Step2Response {
  item: boolean;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: string[] };
}
```

## Implementation Details

### Service Method

**File:** `src/app/services/service-request.service.ts`

```typescript
submitStep2ServiceAddress(data: Step2ServiceAddressRequest): Observable<Step2Response> {
  console.log('Submitting Step 2 - Service Address:', data);

  return this.http.post<Step2Response>(`${this.BASE_URL}/step2`, data).pipe(
    tap(response => {
      if (response.isSuccessful) {
        console.log('Step 2 submitted successfully:', response);
      } else {
        console.error('Step 2 submission failed:', response.statusMessage, response.errorDetails);
      }
    }),
    catchError(error => {
      console.error('Error submitting Step 2:', error);
      // Returns formatted error response
      const errorResponse: Step2Response = {
        item: false,
        isSuccessful: false,
        statusMessage: error.error?.statusMessage || 'Network error occurred',
        errorDetails: error.error?.errorDetails || { error: [error.message || 'Unknown error'] }
      };
      return of(errorResponse);
    })
  );
}
```

### Component Integration

**File:** `src/app/pages/apps/my-applications/add-application/add-application.component.ts`

#### Added Properties:

```typescript
isSubmittingStep2: boolean = false;
```

#### Submit Method:

```typescript
submitStep2ServiceAddress(): void {
  if (!this.serviceId) {
    this.showSnackbar('Missing service information');
    return;
  }

  // Validate the location form
  if (this.locationFormGroup.invalid) {
    this.showSnackbar('Please fill in all required fields');
    this.locationFormGroup.markAllAsTouched();
    return;
  }

  const formValue = this.locationFormGroup.value;

  // Map form fields to API fields
  const requestData: Step2ServiceAddressRequest = {
    serviceRequestId: this.createdServiceRequestId || this.serviceId,
    addressLine1: formValue.buildingName || '',
    addressLine2: formValue.street || undefined,
    road: formValue.street || undefined,
    houseNumber: undefined, // Not in current form
    islandId: 1, // TODO: Map from city/region to actual island ID
    postalCode: undefined // Not in current form
  };

  this.isSubmittingStep2 = true;

  this.serviceRequestService.submitStep2ServiceAddress(requestData).subscribe({
    next: (response) => {
      this.isSubmittingStep2 = false;

      if (response.isSuccessful) {
        this.showSnackbar('Service address saved successfully!');
        
        // Auto-advance to next step after delay
        if (this.stepper) {
          setTimeout(() => this.stepper.next(), 500);
        }
      } else {
        // Handle validation errors
        const errors = response.errorDetails;
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorKey]?.[0] || response.statusMessage;
        
        this.showSnackbar(`Failed to save service address: ${firstErrorMessage}`);
      }
    },
    error: (error) => {
      this.isSubmittingStep2 = false;
      this.showSnackbar('An error occurred while submitting service address');
    }
  });
}
```

### Template Changes

**File:** `add-application.component.html`

Updated the Service Address step Next button:

```html
<button 
  mat-flat-button 
  color="primary" 
  type="button" 
  (click)="submitStep2ServiceAddress()"
  [disabled]="isSubmittingStep2">
  @if (isSubmittingStep2) {
    <mat-spinner diameter="20" class="m-r-8"></mat-spinner>
  }
  {{ isSubmittingStep2 ? 'Submitting...' : 'Next' }}
  @if (!isSubmittingStep2) {
    <i-tabler name="arrow-right" class="icon-18 m-l-4"></i-tabler>
  }
</button>
```

## Data Mapping

### Current Form Fields → API Fields

| Form Field | API Field | Notes |
|-----------|-----------|-------|
| `buildingName` | `addressLine1` | Required |
| `street` | `addressLine2` | Optional |
| `street` | `road` | Duplicate mapping |
| N/A | `houseNumber` | Not in current form - set to undefined |
| N/A (hardcoded) | `islandId` | **TODO: Implement island lookup from city/region** |
| N/A | `postalCode` | Not in current form - set to undefined |

### Missing Form Fields

The following fields are expected by the API but not currently in the form:

1. **`houseNumber`** - House/building number
2. **`postalCode`** - Postal code for the address
3. **`islandId`** - Currently hardcoded to `1`, needs proper island mapping

## Island ID Mapping

**⚠️ Important:** The `islandId` is currently hardcoded to `1`. This needs to be implemented properly.

### Recommended Implementation:

1. **Option 1: API Lookup**
   - Create an endpoint to get islands by region/city
   - Fetch island list on region/city change
   - Store island ID when user selects city

2. **Option 2: Static Mapping**
   - Create a constant mapping of city names to island IDs
   - Look up island ID based on selected city

3. **Option 3: Form Field**
   - Add an island dropdown to the form
   - Populate based on selected region

### Example Island Mapping (Option 2):

```typescript
const ISLAND_MAP: { [key: string]: number } = {
  'Male': 1,
  'Hulhumale': 1,
  'Vilimale': 2,
  'Addu City': 3,
  // ... add more islands
};

// In the submit method:
islandId: ISLAND_MAP[formValue.city] || 1
```

## Data Flow

1. **User fills Service Address form:**
   - Region (dropdown)
   - City (dropdown)
   - Building Name (text input)
   - Street (text input)

2. **User clicks "Next" button:**
   - Triggers `submitStep2ServiceAddress()`
   - Validates form fields
   - Sets `isSubmittingStep2 = true`

3. **Data Mapping:**
   - Maps form values to API request format
   - Uses `createdServiceRequestId` from Step 1 (if available)
   - Falls back to `serviceId` from query params

4. **API Call:**
   - POST request to `/api/v1/servicerequests/step2`
   - Includes service request ID and address details

5. **Response Handling:**
   - **Success:** Show success message, auto-advance to Step 3
   - **Validation Error:** Extract first error, show in snackbar
   - **Network Error:** Show generic error message
   - Sets `isSubmittingStep2 = false`

6. **UI Feedback:**
   - Loading spinner during submission
   - Button disabled during submission
   - Success/error snackbar messages
   - Auto-advance to next step (500ms delay)

## Error Handling

### Validation Errors

```typescript
{
  "errorDetails": {
    "islandId": ["Invalid island."],
    "addressLine1": ["Address line 1 is required."]
  }
}
```

**Handling:** Extracts first error key and first error message, displays in snackbar

### Network Errors

Caught by `catchError` operator, returns formatted `Step2Response` with:
- `item: false`
- `isSuccessful: false`
- `statusMessage`: From error or "Network error occurred"
- `errorDetails`: From error or generic error object

### Form Validation

- Checks `locationFormGroup.invalid` before submission
- Calls `markAllAsTouched()` to show validation errors
- Shows "Please fill in all required fields" message

## Testing Checklist

- [ ] Form validates required fields (region, city, buildingName, street)
- [ ] Clicking Next with invalid form shows error
- [ ] Valid form triggers API call
- [ ] Loading spinner shows during submission
- [ ] Button is disabled during submission
- [ ] Success response shows success message
- [ ] Success response auto-advances to Step 3
- [ ] Validation error shows specific error message
- [ ] Network error shows generic error message
- [ ] Console logs show request/response details
- [ ] Step 1's `createdServiceRequestId` is used if available
- [ ] Falls back to `serviceId` if no `createdServiceRequestId`
- [ ] Invalid island ID shows error from API

## Known Limitations

1. **Island ID Hardcoded:** Currently set to `1` for all requests
2. **Missing Form Fields:** `houseNumber` and `postalCode` not collected
3. **Duplicate Mapping:** `street` is mapped to both `addressLine2` and `road`
4. **No Island Validation:** No client-side validation for island ID

## Future Enhancements

1. **Add Missing Form Fields:**
   ```html
   <mat-form-field>
     <mat-label>House Number</mat-label>
     <input matInput formControlName="houseNumber" />
   </mat-form-field>

   <mat-form-field>
     <mat-label>Postal Code</mat-label>
     <input matInput formControlName="postalCode" />
   </mat-form-field>
   ```

2. **Implement Island Lookup:**
   - Fetch islands from API
   - Add island dropdown
   - Auto-select based on city/region

3. **Store Created Service Request ID:**
   - Save `createdServiceRequestId` from Step 1 response
   - Use for all subsequent steps

4. **Address Validation:**
   - Validate address format
   - Check if address already exists
   - Suggest address autocomplete

5. **Map Integration:**
   - Show location on map
   - Allow pin dropping
   - Reverse geocoding

## Related Files

- `src/app/services/service-request.service.ts` - API service
- `src/app/pages/apps/my-applications/add-application/add-application.component.ts` - Component logic
- `src/app/pages/apps/my-applications/add-application/add-application.component.html` - Template
- `STEP1_API_INTEGRATION.md` - Step 1 documentation

## API Documentation

For complete API documentation, refer to:
- Base URL: `https://e-portal-api-dev-01.mwsc.com.mv/api/v1/servicerequests`
- Swagger/OpenAPI documentation (if available)
