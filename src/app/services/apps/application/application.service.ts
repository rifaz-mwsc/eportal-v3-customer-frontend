import { Injectable, signal } from '@angular/core';
import { Application } from 'src/app/pages/apps/my-applications/application';
import { applications } from 'src/app/pages/apps/my-applications/applicationData';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  public applications = signal<Application[]>(applications);
  public dialogData = signal<Application | null>(null);
  public dataChange = new BehaviorSubject<Application[]>([]);

  constructor() {
    this.dataChange.next(applications);
  }

  public getApplications(): Application[] {
    return this.applications();
  }

  public getApplication(id: number): Application | undefined {
    return this.applications().find((app) => app.id === id);
  }

  public addApplication(application: Application): void {
    const currentApplications = this.applications();
    const newId = Math.max(...currentApplications.map((a) => a.id), 0) + 1;
    application.id = newId;
    this.applications.set([...currentApplications, application]);
    this.dataChange.next(this.applications());
  }

  public updateApplication(application: Application): void {
    const currentApplications = this.applications();
    const index = currentApplications.findIndex((a) => a.id === application.id);
    if (index !== -1) {
      currentApplications[index] = application;
      this.applications.set([...currentApplications]);
      this.dataChange.next(this.applications());
    }
  }

  public deleteApplication(id: number): void {
    const currentApplications = this.applications().filter((a) => a.id !== id);
    this.applications.set(currentApplications);
    this.dataChange.next(this.applications());
  }

  public setDialogData(data: Application | null): void {
    this.dialogData.set(data);
  }
}
