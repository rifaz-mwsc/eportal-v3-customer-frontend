import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceDirectoryService } from 'src/app/services/apps/service-directory/service-directory.service';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-directory-detail',
  templateUrl: './service-directory-detail.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    TablerIconsModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    CommonModule,
  ],
})
export class ServiceDirectoryComponentDetailComponent {
  id = signal<any>(null);
  serviceDetail = signal<any>(null);

  constructor(
    activatedRouter: ActivatedRoute,
    public serviceDirectoryService: ServiceDirectoryService,
    private router: Router
  ) {
    this.id.set(activatedRouter?.snapshot?.paramMap?.get('id'));

    const services = this.serviceDirectoryService.getServiceDirectory();
    this.serviceDetail.set(services.filter((x) => x?.Id === +this.id())[0]);
  }

  goBack(): void {
    this.router.navigate(['/apps/ServiceDirectory']);
  }

  goApply(): void {
    this.router.navigate(['/apps/ServiceDirectory/apply', this.id()]);
    // Implement the logic to navigate to the application form or process
    console.log('Apply Now clicked for service ID:', this.id());
  }
}
