import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServiceRequestService, ServiceRequestDetail } from 'src/app/services/service-request.service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-application-view',
  templateUrl: './application-view.component.html',
  styleUrls: ['./application-view.component.scss'],
  standalone: true,
  imports: [MaterialModule, CommonModule, RouterModule, TablerIconsModule],
})
export class AppApplicationViewComponent implements OnInit {
  application = signal<ServiceRequestDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  applicationId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceRequestService: ServiceRequestService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.applicationId = params['id'];
      this.loadApplication();
    });
  }

  private loadApplication(): void {
    this.loading.set(true);
    this.error.set(null);

    this.serviceRequestService.getServiceRequestDetailById(this.applicationId).subscribe(response => {
      this.loading.set(false);
      if (response.isSuccessful && response.item) {
        this.application.set(response.item);
      } else {
        this.error.set(response.statusMessage || 'Unable to load application details');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/apps/my-applications/list']);
  }

  printApplication(): void {
    const printArea = document.getElementById('printArea');
    if (!printArea) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
      <head>
        <title>${this.application()?.referenceNumber || 'Application'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; padding: 32px; }
          .doc-header { border-bottom: 3px solid #1e88e5; padding-bottom: 16px; margin-bottom: 20px; }
          .doc-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
          .doc-subtitle { font-size: 13px; color: #666; margin: 0; }
          .doc-ref { font-size: 12px; color: #888; margin-top: 2px; }
          .d-flex { display: flex; }
          .justify-content-between { justify-content: space-between; }
          .align-items-start { align-items: flex-start; }
          .flex-wrap { flex-wrap: wrap; }
          .gap-12 { gap: 12px; }
          .status-badge { display: inline-block; padding: 5px 14px; border-radius: 4px; font-weight: 600; font-size: 12px; border: 1px solid #999; color: #333; background: #eee; }
          .doc-section { margin-bottom: 20px; }
          .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #1e88e5; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0; }
          .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
          .field-row { display: flex; gap: 8px; padding: 3px 0; }
          .field-label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.3px; min-width: 90px; }
          .field-value { font-size: 13px; color: #333; }
          .conn-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px; }
          .conn-table th { background: #f5f7fa; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #555; border-bottom: 2px solid #e0e0e0; }
          .conn-table td { padding: 8px 10px; border-bottom: 1px solid #eee; color: #333; }
          .conn-table .text-center { text-align: center; }
          .conn-cards { display: none; }
          .declaration-box { border: 1px solid #e0e0e0; border-radius: 6px; padding: 14px; background: #fafbfc; font-size: 12px; color: #444; line-height: 1.6; }
          .decl-title { font-weight: 600; font-size: 13px; color: #333; margin-bottom: 6px; }
          .decl-content { margin-bottom: 10px; }
          .decl-content p { margin: 0 0 4px; }
          .decl-status { display: flex; align-items: center; gap: 6px; padding-top: 8px; border-top: 1px solid #e0e0e0; font-size: 11px; font-weight: 600; }
          .accepted { color: #2e7d32; }
          .not-accepted { color: #c62828; }
          .doc-footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #aaa; text-align: right; }
        </style>
      </head>
      <body>${printArea.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending':
        return 'rgb(255, 174, 31)';
      case 'Processing':
        return 'rgb(93, 135, 255)';
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
