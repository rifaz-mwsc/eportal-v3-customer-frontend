import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApplicationService } from 'src/app/services/apps/application/application.service';
import { Application } from '../application';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-application-view',
  templateUrl: './application-view.component.html',
  standalone: true,
  imports: [MaterialModule, CommonModule, RouterModule, TablerIconsModule],
})
export class AppApplicationViewComponent implements OnInit {
  application = signal<Application | undefined>(undefined);
  applicationId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.applicationId = +params['id'];
      const app = this.applicationService.getApplication(this.applicationId);
      this.application.set(app);
    });
  }

  goBack(): void {
    this.router.navigate(['/apps/myApplications/list']);
  }

  printApplication(): void {
    window.print();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending':
        return 'rgb(255, 174, 31)';
      case 'In Progress':
        return 'rgb(93, 135, 255)';
      case 'Approved':
      case 'Resolved':
        return 'rgb(19, 222, 185)';
      case 'Rejected':
        return 'rgb(239, 83, 80)';
      default:
        return 'rgb(158, 158, 158)';
    }
  }
}
