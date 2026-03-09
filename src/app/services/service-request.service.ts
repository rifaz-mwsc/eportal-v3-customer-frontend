import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from './auth.service';

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
          bg_color: 'error',
          icon: 'chart-bubble',
          color: 'text-error'
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
          bg_color: '--mat-sys-outline-variant',
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
}
