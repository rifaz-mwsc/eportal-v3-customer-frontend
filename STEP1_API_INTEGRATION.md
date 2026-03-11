# Step 1 - Owner Details API Integration

## Overview
This document describes the integration of the Step 1 (Owner Details) API for the service request application form.

## API Endpoint
```
POST https://e-portal-api-dev-01.mwsc.com.mv/api/v1/servicerequests/step1
```

## Request Body Interface
```typescript
interface Step1OwnerDetailsRequest {
  requestTypeId: string;              // Required
  serviceRequestId: string;           // Required
  profileId?: string;                 // Optional - if using existing profile
  isOwner: boolean;                   // Required
  firstName?: string;                 // For individuals
  lastName?: string;                  // For individuals
  identificationNumber?: string;      // For individuals
  companyName?: string;               // For entities/companies
  registrationNumber?: string;        // For entities/companies
  mobileNumber?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  islandId?: number;
  businessPartnerCategoryId?: string;
}
```

## Response Interface
```typescript
interface Step1Response {
  item: boolean;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: string[] };
}
```

## Success Response Example
```json
{
  "item": true,
  "isSuccessful": true,
  "statusMessage": "success",
  "errorDetails": {}
}
```

## Error Response Example
```json
{
  "item": false,
  "isSuccessful": false,
  "statusMessage": "Unable to create service request",
  "errorDetails": {
    "typeId": ["Invalid request type."]
  }
}
```

## Implementation Details

### Service Method
**File:** `src/app/services/service-request.service.ts`

```typescript
submitStep1OwnerDetails(data: Step1OwnerDetailsRequest): Observable<Step1Response>
```

**Features:**
- Comprehensive error handling with catchError
- Detailed console logging for debugging
- Returns formatted error responses on network failures
- Proper TypeScript typing for request and response

### Component Integration
**File:** `src/app/pages/apps/my-applications/add-application/add-application.component.ts`

**New Properties:**
- `requestTypeId: string | null` - Captured from query params
- `createdServiceRequestId: string | null` - Stores created request ID
- `isSubmittingStep1: boolean` - Loading state for UI

**Method:** `submitStep1OwnerDetails(): void`

**Logic Flow:**
1. Validates `requestTypeId` and `serviceId` are present
2. Builds request payload based on owner selection:
   - **If Owner (isOwner = true):**
     - Uses selected profile or current user data
     - Includes profileId for existing profiles
     - Maps profile data (Individual vs Entity)
     - Includes permanent address if available
   
   - **If Not Owner (isOwner = false):**
     - Checks if manual entry ('other') or existing profile
     - For manual entry: uses `otherProfile` data
     - For existing profile: maps profile data similar to owner

3. Makes API call via service
4. Handles response:
   - **Success:** Shows success message, auto-advances to next step
   - **Error:** Displays first validation error from errorDetails
   - **Network Error:** Shows generic error message

### UI Changes
**File:** `src/app/pages/apps/my-applications/add-application/add-application.component.html`

**Next Button Updated:**
```html
<button 
  mat-flat-button 
  color="primary" 
  type="button"
  (click)="submitStep1OwnerDetails()"
  [disabled]="isSubmittingStep1">
  @if(isSubmittingStep1) {
    <mat-spinner diameter="20" class="m-r-8"></mat-spinner>
  }
  {{ isSubmittingStep1 ? 'Submitting...' : 'Next' }}
</button>
```

**Features:**
- Disabled during submission
- Shows loading spinner
- Dynamic button text

## Data Mapping

### UserProfile to API Request
```typescript
// Individual Profile
firstName: profile.firstName || undefined
lastName: profile.lastName || undefined
identificationNumber: profile.identityNumber || undefined
mobileNumber: profile.mobileNo || undefined
email: profile.email

// Entity Profile
companyName: profile.entityName || undefined
registrationNumber: profile.registrationNumber || undefined
mobileNumber: profile.mobileNo || undefined
email: profile.email

// Address (permanentAddress)
addressLine1: address.addressLine1 || undefined
addressLine2: address.addressLine2 || undefined
postalCode: address.postalCode || undefined
```

### Manual Entry (Other Profile)
```typescript
// Individual
firstName: otherProfile.name.split(' ')[0]
lastName: otherProfile.name.split(' ').slice(1).join(' ')
identificationNumber: otherProfile.idCardNo
mobileNumber: otherProfile.phone
email: otherProfile.email

// Company
companyName: otherProfile.companyName
registrationNumber: otherProfile.registrationNo
mobileNumber: otherProfile.phone
email: otherProfile.email

// Address
addressLine1: otherProfile.street
addressLine2: otherProfile.city
postalCode: otherProfile.postalCode
```

## Query Parameters Required
The component expects these query parameters when navigating:
- `serviceId` - The service request ID
- `serviceName` - The service name (for display)
- `requestTypeId` - The request type ID (NEW - required for API)

**Example Navigation:**
```typescript
this.router.navigate(['/apps/my-applications/add'], {
  queryParams: {
    serviceId: '123e4567-e89b-12d3-a456-426614174000',
    serviceName: 'New Water Connection',
    requestTypeId: '789e4567-e89b-12d3-a456-426614174111'
  }
});
```

## Error Handling

### Validation Errors
- Extracts first error message from `errorDetails` object
- Displays in snackbar notification
- Logs all errors to console for debugging

### Network Errors
- Catches HTTP errors
- Returns formatted error response
- Shows user-friendly message

### Missing Data
- Checks for required `requestTypeId` and `serviceId`
- Shows error message if missing

## Stepper Integration
- Uses `@ViewChild` to access MatStepper
- Auto-advances to next step on successful submission
- 500ms delay for smooth transition and snackbar visibility

## Console Logging
Detailed logging for debugging:
- Request data before submission
- API response
- Success/failure status
- Validation errors
- Network errors

## Testing Checklist
- [ ] Owner (existing individual profile)
- [ ] Owner (existing entity profile)
- [ ] Owner (with address)
- [ ] Owner (without address)
- [ ] Not owner (manual individual entry)
- [ ] Not owner (manual company entry)
- [ ] Not owner (existing profile)
- [ ] Validation errors display correctly
- [ ] Network errors handled gracefully
- [ ] Loading state works
- [ ] Auto-advance to next step
- [ ] Missing requestTypeId handled

## Future Enhancements
1. Store `createdServiceRequestId` from API response (if API returns it)
2. Add businessPartnerCategoryId selection
3. Add islandId mapping from island name
4. Form validation before submission
5. Retry mechanism for network failures
