import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PremiseType {
  id: number;
  name: string;
}

export interface Division {
  id: number;
  name: string;
}

export interface BusinessCategory {
  id: string;
  name: string;
}

export interface TariffGroup {
  id: number;
  name: string;
}

export interface Floor {
  id: number;
  number: number;
}

export interface IdentificationType {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private premiseTypesCache: PremiseType[] | null = null;
  
  // Cache observables for new lookups
  private divisions$: Observable<Division[]> | null = null;
  private businessCategories$: Observable<BusinessCategory[]> | null = null;
  private tariffGroups$: Observable<TariffGroup[]> | null = null;
  private floors$: Observable<Floor[]> | null = null;
  private identificationTypes$: Observable<IdentificationType[]> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Get all premise types
   * Uses caching to avoid repeated API calls
   */
  getPremiseTypes(forceRefresh: boolean = false): Observable<PremiseType[]> {
    // Return cached data if available and not forcing refresh
    if (this.premiseTypesCache && !forceRefresh) {
      return of(this.premiseTypesCache);
    }

    return this.http.get<PremiseType[]>(
      `${environment.apiBaseUrl}/api/v1/lookup/premisetypes`
    ).pipe(
      tap(data => {
        // Cache the response
        this.premiseTypesCache = data;
        console.log('Premise types cached:', data);
        
      }),
      catchError(error => {
        console.error('Error fetching premise types:', error);
        // Return empty array on error
        return of([]);
      })
    );
  }

  /**
   * Get premise type by ID
   */
  getPremiseTypeById(id: number): Observable<PremiseType | undefined> {
    return new Observable(observer => {
      this.getPremiseTypes().subscribe(types => {
        const premiseType = types.find(type => type.id === id);
        observer.next(premiseType);
        observer.complete();
      });
    });
  }

  /**
   * Get premise type name by ID
   */
  getPremiseTypeName(id: number): Observable<string> {
    return new Observable(observer => {
      this.getPremiseTypeById(id).subscribe(type => {
        observer.next(type?.name || 'Unknown');
        observer.complete();
      });
    });
  }

  /**
   * Clear all cached lookup data
   */
  clearCache(): void {
    this.premiseTypesCache = null;
    this.divisions$ = null;
    this.businessCategories$ = null;
    this.tariffGroups$ = null;
    this.floors$ = null;
    this.identificationTypes$ = null;
  }

  /**
   * Preload all lookup data
   * Call this on app initialization to cache all master data
   */
  preloadLookupData(): void {
    this.getPremiseTypes().subscribe();
    this.getDivisions().subscribe();
    this.getBusinessCategories().subscribe();
    this.getTariffGroups().subscribe();
    this.getFloors().subscribe();
    this.getIdentificationTypes().subscribe();
  }

  // ===== NEW LOOKUP METHODS =====

  /**
   * Get all divisions
   * Cached after first call
   */
  getDivisions(): Observable<Division[]> {
    if (!this.divisions$) {
      this.divisions$ = this.http.get<Division[]>(
        `${environment.apiBaseUrl}/api/v1/lookup/divisions`
      ).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching divisions:', error);
          return of([]);
        })
      );
    }
    return this.divisions$;
  }

  /**
   * Get all business categories
   * Cached after first call
   */
  getBusinessCategories(): Observable<BusinessCategory[]> {
    if (!this.businessCategories$) {
      this.businessCategories$ = this.http.get<BusinessCategory[]>(
        `${environment.apiBaseUrl}/api/v1/lookup/bussinesscategories`
      ).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching business categories:', error);
          return of([]);
        })
      );
    }
    return this.businessCategories$;
  }

  /**
   * Get all tariff groups
   * Cached after first call
   */
  getTariffGroups(): Observable<TariffGroup[]> {
    if (!this.tariffGroups$) {
      this.tariffGroups$ = this.http.get<TariffGroup[]>(
        `${environment.apiBaseUrl}/api/v1/lookup/tarifgroups`
      ).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching tariff groups:', error);
          return of([]);
        })
      );
    }
    return this.tariffGroups$;
  }

  /**
   * Get all floors
   * Cached after first call
   */
  getFloors(): Observable<Floor[]> {
    if (!this.floors$) {
      this.floors$ = this.http.get<Floor[]>(
        `${environment.apiBaseUrl}/api/v1/lookup/floors`
      ).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching floors:', error);
          return of([]);
        })
      );
    }
    return this.floors$;
  }

  /**
   * Get all identification types
   * Cached after first call
   */
  getIdentificationTypes(): Observable<IdentificationType[]> {
    if (!this.identificationTypes$) {
      this.identificationTypes$ = this.http.get<IdentificationType[]>(
        `${environment.apiBaseUrl}/api/v1/lookup/identificationtypes`
      ).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching identification types:', error);
          return of([]);
        })
      );
    }
    return this.identificationTypes$;
  }

  /**
   * Get division by ID
   */
  getDivisionById(id: number): Observable<Division | undefined> {
    return new Observable(observer => {
      this.getDivisions().subscribe(divisions => {
        const division = divisions.find(d => d.id === id);
        observer.next(division);
        observer.complete();
      });
    });
  }

  /**
   * Get business category by ID
   */
  getBusinessCategoryById(id: string): Observable<BusinessCategory | undefined> {
    return new Observable(observer => {
      this.getBusinessCategories().subscribe(categories => {
        const category = categories.find(c => c.id === id);
        observer.next(category);
        observer.complete();
      });
    });
  }

  /**
   * Get tariff group by ID
   */
  getTariffGroupById(id: number): Observable<TariffGroup | undefined> {
    return new Observable(observer => {
      this.getTariffGroups().subscribe(groups => {
        const group = groups.find(g => g.id === id);
        observer.next(group);
        observer.complete();
      });
    });
  }

  /**
   * Get floor by ID
   */
  getFloorById(id: number): Observable<Floor | undefined> {
    return new Observable(observer => {
      this.getFloors().subscribe(floors => {
        const floor = floors.find(f => f.id === id);
        observer.next(floor);
        observer.complete();
      });
    });
  }

  /**
   * Get identification type by ID
   */
  getIdentificationTypeById(id: string): Observable<IdentificationType | undefined> {
    return new Observable(observer => {
      this.getIdentificationTypes().subscribe(types => {
        const type = types.find(t => t.id === id);
        observer.next(type);
        observer.complete();
      });
    });
  }

  /**
   * Refresh specific lookup caches
   */
  refreshDivisions(): Observable<Division[]> {
    this.divisions$ = null;
    return this.getDivisions();
  }

  refreshBusinessCategories(): Observable<BusinessCategory[]> {
    this.businessCategories$ = null;
    return this.getBusinessCategories();
  }

  refreshTariffGroups(): Observable<TariffGroup[]> {
    this.tariffGroups$ = null;
    return this.getTariffGroups();
  }

  refreshFloors(): Observable<Floor[]> {
    this.floors$ = null;
    return this.getFloors();
  }

  refreshIdentificationTypes(): Observable<IdentificationType[]> {
    this.identificationTypes$ = null;
    return this.getIdentificationTypes();
  }
}
