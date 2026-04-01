import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from './auth.service';

// My Applications interfaces
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

export interface ServiceRequiredAddress {
  buildingName: string | null;
  houseNumber: string | null;
  street: string | null;
  postalCode: string | null;
  islandId: number | null;
  island: string | null;
  addressType: string | null;
}

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

// Detail view interfaces (GET /api/v1/servicerequests?id={guid})
export interface OwnerAddress {
  address: {
    addressLine1: string | null;
    island: string | null;
    postalCode: string | null;
  };
}

export interface OwnerDetailFull {
  id: string;
  isOwner: boolean;
  profileId: string | null;
  profileName: string | null;
  ownerAddresses: OwnerAddress[];
}

export interface ConnectionDetail {
  id: string;
  quantity: number;
  meterNo: string | null;
  floorId: number;
  floor: string | null;
  tariffGroupId: number;
  tariffGroup: string | null;
}

export interface DeclarationDetail {
  id: string;
  declarationId: string;
  title: string;
  content: string;
  isAccepted: boolean;
  acceptedOn: string | null;
}

export interface ServiceRequestDetail {
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
  ownerDetail: OwnerDetailFull;
  serviceRequiredAddress: ServiceRequiredAddress | null;
  connectionDetails: ConnectionDetail[];
  documents: any[] | null;
  declaration: DeclarationDetail | null;
}

export interface ServiceRequestDetailResponse {
  item: ServiceRequestDetail | null;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: any };
}

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

export interface MyServiceRequestsResponse {
  item: PaginatedResponse<MyServiceRequest>;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: any };
}

// Step 1 - Owner Details interfaces
export interface Step1OwnerDetailsRequest {
  requestTypeId: string;
  serviceRequestId: string;
  profileId?: string;
  isOwner: boolean;
  firstName?: string;
  lastName?: string;
  identificationNumber?: string;
  companyName?: string;
  registrationNumber?: string;
  mobileNumber?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  islandId?: number;
  businessPartnerCategoryId?: string;
}

export interface Step1Response {
  item: boolean;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: string[] };
}

// Step 2 - Service Address interfaces
export interface Step2ServiceAddressRequest {
  requestId: string;
  buildingName: string;
  houseNumber: string;
  street: string;
  postalCode?: string;
  islandId: number;
}

export interface Step2Response {
  item: boolean;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: string[] };
}

// Step 3 - Connection Details interfaces
export interface ConnectionItem {
  quantity: number;
  floorId: number;
  tarrifGroupId: number;
  meterNo: string;
}

export interface Step3ConnectionDetailsRequest {
  requestId: string;
  isNewConnection: boolean;
  connectionItems: ConnectionItem[];
}

export interface Step3Response {
  item: boolean;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: string[] };
}

// Step 4 - Document Upload interfaces
export interface Step4Response {
  status: string;
  message: string;
}

// Step 5 - Declaration interfaces
export interface Step5DeclarationRequest {
  requestId: string;
  declarationId: string;
  isAccepted: boolean;
}

export interface Step5Response {
  item: boolean;
  isSuccessful: boolean;
  statusMessage: string;
  errorDetails: { [key: string]: string[] };
}

// Document interfaces
export interface RequestPipelineStepDocument {
  requestPipelineStepId: string;
  requestPipelineStep: string;
  documentTypeId: string;
  documentType: string;
  isRequired: boolean;
  displayOrder: number;
}

// Pipeline Step interfaces
export interface RequestPipelineStep {
  stepKey: string;
  title: string;
  description: string;
  stepOrder: number;
  isRequired: boolean;
  pipelineStepType: 'FormSection' | 'DocumentUpload' | 'Declaration';
  declarationContent: string | null;
  requestPipelineStepDocuments: RequestPipelineStepDocument[];
}

// Pipeline Guideline interfaces
export interface RequestPipelineGuideline {
  title: string;
  subTitle: string;
  content: string;
  stepOrder: number;
}

// Service Request interfaces
export interface ServiceRequest {
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

// Request Type interfaces
export interface RequestType {
  id: string;
  name: string;
  serviceRequests: ServiceRequest[];
}

// Service Request with Request Type info
export interface ServiceRequestWithType extends ServiceRequest {
  requestTypeId: string;
  requestTypeName: string;
  bg_color: string;
  icon: string;
  color: string;
}

// Pagination interfaces
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

export type RequestTypesResponse = ApiResponse<PaginatedResponse<RequestType>>;

@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  private readonly BASE_URL = `${environment.apiBaseUrl}/api/v1/servicerequests`;
  
  // Cache for request types
  private requestTypesCache: RequestType[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private http: HttpClient) {}

  /**
   * Get UI properties based on service request characteristics
   * @param serviceRequest - The service request to get UI properties for
   * @param requestTypeName - The name of the request type
   */
  private getServiceUIProperties(serviceRequest: ServiceRequest, requestTypeName: string): { bg_color: string; icon: string; color: string } {
    // Determine UI properties based on request type and service characteristics
    if (serviceRequest.isNewConnection) {
      // New connection services - use primary/error theme
      if (requestTypeName.toLowerCase().includes('water')) {
        return {
          bg_color: 'error',
          icon: 'chart-bubble',
          color: 'text-error'
        };
      } else if (requestTypeName.toLowerCase().includes('sewerage') || requestTypeName.toLowerCase().includes('sewer')) {
        return {
          bg_color: 'primary',
          icon: 'building-store',
          color: 'text-primary'
        };
      } else {
        return {
          bg_color: 'primary',
          icon: 'chart-bubble',
          color: 'text-primary'
        };
      }
    } else {
      // Change/modification services - use secondary/warning theme
      if (serviceRequest.name.toLowerCase().includes('tariff') || serviceRequest.name.toLowerCase().includes('billing')) {
        return {
          bg_color: 'secondary',
          icon: 'category-2',
          color: 'text-secondary'
        };
      } else if (serviceRequest.name.toLowerCase().includes('ownership') || serviceRequest.name.toLowerCase().includes('transfer')) {
        return {
          bg_color: 'secondary',
          icon: 'activity-heartbeat',
          color: 'text-dark'
        };
      } else if (serviceRequest.name.toLowerCase().includes('repair') || serviceRequest.name.toLowerCase().includes('maintenance')) {
        return {
          bg_color: 'error',
          icon: 'chart-bubble',
          color: 'text-error'
        };
      } else {
        return {
          bg_color: 'secondary',
          icon: 'category-2',
          color: 'text-secondary'
        };
      }
    }
  }

  /**
   * Get all request types with pagination
   * @param searchValue - Search term to filter request types
   * @param pageNumber - Page number (default: 1)
   * @param pageSize - Number of items per page (default: 100)
   * @param forceRefresh - Force refresh from API (bypass cache)
   */
  getRequestTypes(
    searchValue: string = '',
    pageNumber: number = 1,
    pageSize: number = 100,
    forceRefresh: boolean = false
  ): Observable<PaginatedResponse<RequestType>> {
    // Check cache validity
    const isCacheValid = this.requestTypesCache && 
                        this.cacheTimestamp && 
                        (Date.now() - this.cacheTimestamp < this.CACHE_DURATION);

    // Return cached data if valid and not forcing refresh
    if (isCacheValid && !forceRefresh && !searchValue && pageNumber === 1) {
      return of({
        pageNumber: 1,
        totalPages: 1,
        pageSize: this.requestTypesCache!.length,
        maxPageSize: 1000,
        totalCount: this.requestTypesCache!.length,
        hasPrevious: false,
        hasNext: false,
        items: this.requestTypesCache!
      });
    }

    // Build query parameters
    const params = new HttpParams()
      .set('searchValue', searchValue)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<RequestTypesResponse>(
      `${this.BASE_URL}/requesttypes`,
      { params }
    ).pipe(
      map(response => {
        if (!response.isSuccessful || !response.item) {
          throw {
            statusMessage: response.statusMessage,
            errorDetails: response.errorDetails
          };
        }
        return response.item;
      }),
      tap(data => {
        // Cache the full list if it's the first page without search
        if (!searchValue && pageNumber === 1) {
          this.requestTypesCache = data.items;
          this.cacheTimestamp = Date.now();
          console.log('Request types cached:', data.items.length, 'types');
        }
      }),
      catchError(error => {
        console.error('Error fetching request types:', error);
        // Return empty paginated response on error
        return of({
          pageNumber: 1,
          totalPages: 0,
          pageSize: pageSize,
          maxPageSize: 1000,
          totalCount: 0,
          hasPrevious: false,
          hasNext: false,
          items: []
        });
      })
    );
  }

  /**
   * Get a specific request type by ID
   * @param requestTypeId - The ID of the request type
   */
  getRequestTypeById(requestTypeId: string): Observable<RequestType | null> {
    // Check cache first
    if (this.requestTypesCache) {
      const cached = this.requestTypesCache.find(rt => rt.id === requestTypeId);
      if (cached) {
        return of(cached);
      }
    }

    // If not in cache, fetch all and find it
    return this.getRequestTypes('', 1, 100, true).pipe(
      map(response => {
        const found = response.items.find(rt => rt.id === requestTypeId);
        return found || null;
      })
    );
  }

  /**
   * Get a specific service request by ID
   * @param serviceRequestId - The ID of the service request
   */
  getServiceRequestById(serviceRequestId: string): Observable<ServiceRequest | null> {
    // Check cache first
    if (this.requestTypesCache) {
      for (const requestType of this.requestTypesCache) {
        const found = requestType.serviceRequests.find(sr => sr.id === serviceRequestId);
        if (found) {
          return of(found);
        }
      }
    }

    // If not in cache, fetch all and find it
    return this.getRequestTypes('', 1, 100, true).pipe(
      map(response => {
        for (const requestType of response.items) {
          const found = requestType.serviceRequests.find(sr => sr.id === serviceRequestId);
          if (found) {
            return found;
          }
        }
        return null;
      })
    );
  }

  /**
   * Get all service requests (flattened from all request types)
   */
  getAllServiceRequests(): Observable<ServiceRequest[]> {
    return this.getRequestTypes('', 1, 100).pipe(
      map(response => {
        const allServiceRequests: ServiceRequest[] = [];
        response.items.forEach(requestType => {
          allServiceRequests.push(...requestType.serviceRequests);
        });
        return allServiceRequests;
      })
    );
  }

  /**
   * Get new connection service requests only
   */
  getNewConnectionRequests(): Observable<ServiceRequest[]> {
    return this.getAllServiceRequests().pipe(
      map(requests => requests.filter(r => r.isNewConnection))
    );
  }

  /**
   * Get change connection service requests only
   */
  getChangeConnectionRequests(): Observable<ServiceRequest[]> {
    return this.getAllServiceRequests().pipe(
      map(requests => requests.filter(r => !r.isNewConnection))
    );
  }

  /**
   * Search service requests by name
   * @param searchTerm - The search term
   */
  searchServiceRequests(searchTerm: string): Observable<ServiceRequest[]> {
    if (!searchTerm || searchTerm.trim() === '') {
      return this.getAllServiceRequests();
    }

    const term = searchTerm.toLowerCase();
    return this.getAllServiceRequests().pipe(
      map(requests => 
        requests.filter(r => 
          r.name.toLowerCase().includes(term)
        )
      )
    );
  }

  /**
   * Get all service requests with their request type information
   * Returns a flattened list where each service request includes its parent request type details
   */
  getAllServiceRequestsWithType(): Observable<ServiceRequestWithType[]> {
    return this.getRequestTypes('', 1, 100).pipe(
      map(response => {
        const allServiceRequests: ServiceRequestWithType[] = [];
        
        response.items.forEach(requestType => {
          requestType.serviceRequests.forEach(serviceRequest => {
            const uiProps = this.getServiceUIProperties(serviceRequest, requestType.name);
            
            allServiceRequests.push({
              ...serviceRequest,
              requestTypeId: requestType.id,
              requestTypeName: requestType.name,
              bg_color: uiProps.bg_color,
              icon: uiProps.icon,
              color: uiProps.color
            });
          });
        });
        
        return allServiceRequests;
      })
    );
  }

  /**
   * Get pipeline steps for a service request
   * @param serviceRequestId - The ID of the service request
   */
  getPipelineSteps(serviceRequestId: string): Observable<RequestPipelineStep[]> {
    return this.getServiceRequestById(serviceRequestId).pipe(
      map(serviceRequest => {
        if (!serviceRequest) {
          return [];
        }
        // Sort by step order
        return [...serviceRequest.requestPipelineSteps].sort((a, b) => a.stepOrder - b.stepOrder);
      })
    );
  }

  /**
   * Get pipeline guidelines for a service request
   * @param serviceRequestId - The ID of the service request
   */
  getPipelineGuidelines(serviceRequestId: string): Observable<RequestPipelineGuideline[]> {
    return this.getServiceRequestById(serviceRequestId).pipe(
      map(serviceRequest => {
        if (!serviceRequest) {
          return [];
        }
        // Sort by step order
        return [...serviceRequest.requestPipelineGuidelines].sort((a, b) => a.stepOrder - b.stepOrder);
      })
    );
  }

  /**
   * Get required documents for a service request
   * @param serviceRequestId - The ID of the service request
   */
  getRequiredDocuments(serviceRequestId: string): Observable<RequestPipelineStepDocument[]> {
    return this.getPipelineSteps(serviceRequestId).pipe(
      map(steps => {
        const documents: RequestPipelineStepDocument[] = [];
        steps.forEach(step => {
          if (step.pipelineStepType === 'DocumentUpload' && step.requestPipelineStepDocuments) {
            documents.push(...step.requestPipelineStepDocuments);
          }
        });
        // Sort by display order
        return documents.sort((a, b) => a.displayOrder - b.displayOrder);
      })
    );
  }

  /**
   * Get declaration content for a service request
   * @param serviceRequestId - The ID of the service request
   */
  getDeclarationContent(serviceRequestId: string): Observable<string | null> {
    return this.getPipelineSteps(serviceRequestId).pipe(
      map(steps => {
        const declarationStep = steps.find(step => step.pipelineStepType === 'Declaration');
        return declarationStep?.declarationContent || null;
      })
    );
  }

  /**
   * Preload request types data
   * Call this on app initialization for authenticated users
   */
  preloadRequestTypes(): Observable<void> {
    return this.getRequestTypes('', 1, 100, true).pipe(
      map(() => {
        console.log('Request types preloaded successfully');
      }),
      catchError(error => {
        console.error('Error preloading request types:', error);
        return of(void 0);
      })
    );
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.requestTypesCache = null;
    this.cacheTimestamp = null;
    console.log('Request types cache cleared');
  }

  /**
   * Submit Step 1 - Owner Details
   * @param data - The owner details data
   */
  submitStep1OwnerDetails(data: Step1OwnerDetailsRequest): Observable<Step1Response> {
    const url = `${this.BASE_URL}/step1`;
    
    console.log('Submitting Step 1 - Owner Details:', data);
    
    return this.http.post<Step1Response>(url, data).pipe(
      tap(response => {
        console.log('Step 1 Response:', response);
        if (response.isSuccessful) {
          console.log('Step 1 submitted successfully');
        } else {
          console.error('Step 1 submission failed:', response.statusMessage, response.errorDetails);
        }
      }),
      catchError(error => {
        console.error('Error submitting Step 1:', error);
        // Return a formatted error response
        const errorResponse: Step1Response = {
          item: false,
          isSuccessful: false,
          statusMessage: error.error?.statusMessage || 'Network error occurred',
          errorDetails: error.error?.errorDetails || { error: [error.message || 'Unknown error'] }
        };
        return of(errorResponse);
      })
    );
  }

  /**
   * Get user's service requests with pagination
   * GET /api/v1/servicerequests/my
   */
  getMyServiceRequests(pageNumber: number = 1, pageSize: number = 100): Observable<MyServiceRequestsResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    console.log('Fetching my service requests:', { pageNumber, pageSize });

    return this.http.get<MyServiceRequestsResponse>(`${this.BASE_URL}/my`, { params }).pipe(
      tap(response => {
        if (response.isSuccessful) {
          console.log('My service requests fetched successfully:', {
            totalCount: response.item.totalCount,
            pageNumber: response.item.pageNumber,
            totalPages: response.item.totalPages,
            itemsCount: response.item.items.length
          });
        } else {
          console.error('Failed to fetch service requests:', response.statusMessage, response.errorDetails);
        }
      }),
      catchError(error => {
        console.error('Error fetching my service requests:', error);
        // Return a formatted error response
        const errorResponse: MyServiceRequestsResponse = {
          item: {
            pageNumber: 1,
            totalPages: 0,
            pageSize: pageSize,
            maxPageSize: 1000,
            totalCount: 0,
            hasPrevious: false,
            hasNext: false,
            items: []
          },
          isSuccessful: false,
          statusMessage: error.error?.statusMessage || 'Network error occurred',
          errorDetails: error.error?.errorDetails || { error: [error.message || 'Unknown error'] }
        };
        return of(errorResponse);
      })
    );
  }

  /**
   * Get service request details by ID
   * GET /api/v1/servicerequests?id={guid}
   */
  getServiceRequestDetailById(id: string): Observable<ServiceRequestDetailResponse> {
    const params = new HttpParams().set('id', id);

    return this.http.get<ServiceRequestDetailResponse>(this.BASE_URL, { params }).pipe(
      tap(response => {
        if (response.isSuccessful) {
          console.log('Service request detail fetched:', response.item?.referenceNumber);
        } else {
          console.error('Failed to fetch service request detail:', response.statusMessage);
        }
      }),
      catchError(error => {
        console.error('Error fetching service request detail:', error);
        return of({
          item: null,
          isSuccessful: false,
          statusMessage: error.error?.statusMessage || 'Network error occurred',
          errorDetails: error.error?.errorDetails || { error: [error.message || 'Unknown error'] }
        });
      })
    );
  }

  /**
   * Submit Step 2 - Service Address
   * POST /api/v1/servicerequests/step2
   */
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
        // Return a formatted error response
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

  /**
   * Submit Step 3 - Connection Details
   * POST /api/v1/servicerequests/step3
   */
  submitStep3ConnectionDetails(data: Step3ConnectionDetailsRequest): Observable<Step3Response> {
    console.log('Submitting Step 3 - Connection Details:', data);

    return this.http.post<Step3Response>(`${this.BASE_URL}/step3`, data).pipe(
      tap(response => {
        if (response.isSuccessful) {
          console.log('Step 3 submitted successfully:', response);
        } else {
          console.error('Step 3 submission failed:', response.statusMessage, response.errorDetails);
        }
      }),
      catchError(error => {
        console.error('Error submitting Step 3:', error);
        // Return a formatted error response
        const errorResponse: Step3Response = {
          item: false,
          isSuccessful: false,
          statusMessage: error.error?.statusMessage || 'Network error occurred',
          errorDetails: error.error?.errorDetails || { error: [error.message || 'Unknown error'] }
        };
        return of(errorResponse);
      })
    );
  }

  /**
   * Submit Step 4 - Document Upload (Placeholder)
   * POST /api/v1/servicerequests/step4
   * Note: File upload API is not ready yet
   */
  submitStep4Documents(): Observable<Step4Response> {
    console.log('Submitting Step 4 - Documents (placeholder call)');

    return this.http.post<Step4Response>(`${this.BASE_URL}/step4`, {}).pipe(
      tap(response => {
        console.log('Step 4 response:', response);
      }),
      catchError(error => {
        console.error('Error submitting Step 4:', error);
        // Return a formatted error response
        const errorResponse: Step4Response = {
          status: 'Error',
          message: error.error?.message || 'Network error occurred'
        };
        return of(errorResponse);
      })
    );
  }

  /**
   * Submit Step 5 - Declaration
   * POST /api/v1/servicerequests/step5
   */
  submitStep5Declaration(data: Step5DeclarationRequest): Observable<Step5Response> {
    console.log('Submitting Step 5 - Declaration:', data);

    return this.http.post<Step5Response>(`${this.BASE_URL}/step5`, data).pipe(
      tap(response => {
        if (response.isSuccessful) {
          console.log('Step 5 submitted successfully:', response);
        } else {
          console.error('Step 5 submission failed:', response.statusMessage, response.errorDetails);
        }
      }),
      catchError(error => {
        console.error('Error submitting Step 5:', error);
        // Return a formatted error response
        const errorResponse: Step5Response = {
          item: false,
          isSuccessful: false,
          statusMessage: error.error?.statusMessage || 'Network error occurred',
          errorDetails: error.error?.errorDetails || { error: [error.message || 'Unknown error'] }
        };
        return of(errorResponse);
      })
    );
  }
}
