import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export interface VersionInfo {
  version: string;
  buildNumber: number;
  buildDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private versionInfo$: Observable<VersionInfo> | null = null;

  constructor(private http: HttpClient) {}

  getVersion(): Observable<VersionInfo> {
    if (!this.versionInfo$) {
      this.versionInfo$ = this.http.get<VersionInfo>('/assets/version.json').pipe(
        shareReplay(1)
      );
    }
    return this.versionInfo$;
  }

  getFullVersion(): Observable<string> {
    return new Observable(observer => {
      this.getVersion().subscribe(info => {
        observer.next(`v${info.version} (Build #${info.buildNumber})`);
        observer.complete();
      });
    });
  }
}
