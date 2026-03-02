import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PremiseType {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private premiseTypesCache: PremiseType[] | null = null;

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
  }

  /**
   * Preload all lookup data
   * Call this on app initialization to cache all master data
   */
  preloadLookupData(): void {
    this.getPremiseTypes().subscribe();
  }
}
