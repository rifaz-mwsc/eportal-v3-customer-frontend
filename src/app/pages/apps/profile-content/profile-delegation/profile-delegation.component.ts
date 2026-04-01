import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  ProfileDelegationService,
  DelegationRequest,
  DelegationApproval,
  ProfileType,
} from 'src/app/services/profile-delegation.service';
import {
  ServiceRequestService,
} from 'src/app/services/service-request.service';

@Component({
  selector: 'app-profile-delegation',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
  templateUrl: './profile-delegation.component.html',
  styleUrls: ['./profile-delegation.component.scss'],
})
export class ProfileDelegationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private delegationService = inject(ProfileDelegationService);
  private serviceRequestService = inject(ServiceRequestService);

  // Form
  showRequestForm = false;
  submitting = false;

  requestForm = this.fb.group({
    identityNumber: ['', Validators.required],
    requestedToProfileTypeId: ['', Validators.required],
  });

  // Resolved from API
  private requestTypeId = '';
  private serviceRequestId = '';

  // Dropdowns
  profileTypes: ProfileType[] = [];

  // Approval list (mock data for design)
  approvals: DelegationApproval[] = [
    {
      id: '1',
      requestedBy: 'Ahmed Ali',
      identityNumber: 'A123456',
      profileType: 'Individual',
      requestDate: '2026-03-28T10:30:00',
      status: 'Pending',
    },
    {
      id: '2',
      requestedBy: 'Maldives Gas Pvt Ltd',
      identityNumber: 'C-0456',
      profileType: 'Entity',
      requestDate: '2026-03-25T14:15:00',
      status: 'Approved',
    },
    {
      id: '3',
      requestedBy: 'Fathimath Mohamed',
      identityNumber: 'A654321',
      profileType: 'Individual',
      requestDate: '2026-03-20T09:00:00',
      status: 'Rejected',
    },
  ];

  ngOnInit(): void {
    this.loadRequestTypes();
    this.loadProfileTypes();
  }

  private loadRequestTypes(): void {
    this.serviceRequestService.getRequestTypes().subscribe(response => {
      const rt = response.items.find(t => t.name === 'Profile Delegation Request');
      if (rt) {
        this.requestTypeId = rt.id;
        const sr = rt.serviceRequests.find(s => s.name === 'Profile Delegation Request');
        if (sr) {
          this.serviceRequestId = sr.id;
        }
      }
    });
  }

  private loadProfileTypes(): void {
    this.delegationService.getProfileTypes().subscribe(types => {
      this.profileTypes = types;
    });
  }

  toggleForm(): void {
    this.showRequestForm = !this.showRequestForm;
    if (!this.showRequestForm) {
      this.requestForm.reset();
    }
  }

  submitRequest(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const data: DelegationRequest = {
      requestTypeId: this.requestTypeId,
      serviceRequestId: this.serviceRequestId,
      ...this.requestForm.value,
    } as DelegationRequest;

    this.delegationService.createDelegationRequest(data).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.isSuccessful) {
          this.showSnackbar('Delegation request sent successfully');
          this.toggleForm();
        } else {
          console.error('Delegation error:', response);
          const details = response.errorDetails
            ? Object.values(response.errorDetails).flat().join('. ')
            : '';
          const message = response.statusMessage || 'Request failed';
          this.showSnackbar(details ? `${message} — ${details}` : message, true);
        }
      },
      error: (err) => {
        this.submitting = false;
        const body = err.error;
        if (body?.errorDetails) {
          const allErrors = Object.values(body.errorDetails).flat().join('. ');
          this.showSnackbar(allErrors || body.statusMessage || 'Request failed', true);
        } else {
          this.showSnackbar(body?.statusMessage || 'An unexpected error occurred.', true);
        }
      },
    });
  }

  // Design-only actions
  onApprove(item: DelegationApproval): void {
    item.status = 'Approved';
    this.showSnackbar('Request approved');
  }

  onReject(item: DelegationApproval): void {
    item.status = 'Rejected';
    this.showSnackbar('Request rejected');
  }

  onRevoke(item: DelegationApproval): void {
    item.status = 'Revoked';
    this.showSnackbar('Request revoked');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return '#ff9800';
      case 'Approved': return '#4caf50';
      case 'Rejected': return '#f44336';
      case 'Revoked': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  }

  private showSnackbar(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: isError ? ['snackbar-error'] : [],
    });
  }
}
