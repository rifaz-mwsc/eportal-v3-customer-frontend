import { Injectable, signal } from '@angular/core';
import { ServiceDirectory } from 'src/app/pages/apps/service-directory/service-directory';
import { serviceDirectoryList } from 'src/app/pages/apps/service-directory/service-directory-data';

@Injectable({
  providedIn: 'root',
})
export class ServiceDirectoryService {
  public serviceDirectory = signal<ServiceDirectory[]>(serviceDirectoryList);

  public getServiceDirectory(): ServiceDirectory[] {
    return this.serviceDirectory();
  }
}
