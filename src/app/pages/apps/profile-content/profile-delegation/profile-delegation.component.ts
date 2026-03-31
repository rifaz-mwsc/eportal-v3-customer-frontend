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
} from 'src/app/services/profile-delegation.service';
import {
  ServiceRequestService,
  RequestType,
  ServiceRequest,
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
    requestTypeId: ['', Validators.required],
    serviceRequestId: ['', Validators.required],
    identityNumber: ['', Validators.required],
    requestedToProfileTypeId: ['', Validators.required],
  });

  // Dropdowns
  requestTypes: RequestType[] = [];
  serviceRequests: ServiceRequest[] = [];
  profileTypes = [
    { id: '1', name: 'Individual' },
    { id: '2', name: 'Entity' },
  ];

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
  }

  private loadRequestTypes(): void {
    this.serviceRequestService.getRequestTypes().subscribe(response => {
      this.requestTypes = response.items;
    });
  }

  onRequestTypeChange(): void {
    const typeId = this.requestForm.get('requestTypeId')?.value;
    this.requestForm.patchValue({ serviceRequestId: '' });
    this.serviceRequests = [];

    if (typeId) {
      const selected = this.requestTypes.find(rt => rt.id === typeId);
      if (selected) {
        this.serviceRequests = selected.serviceRequests;
      }
    }
  }

  toggleForm(): void {
    this.showRequestForm = !this.showRequestForm;
    if (!this.showRequestForm) {
      this.requestForm.reset();
      this.serviceRequests = [];
    }
  }

  submitRequest(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const data: DelegationRequest = this.requestForm.value as DelegationRequest;

    this.delegationService.createDelegationRequest(data).subscribe(response => {
      this.submitting = false;
      if (response.isSuccessful) {
        this.showSnackbar('Delegation request sent successfully');
        this.toggleForm();
      } else {
        const errors = response.errorDetails;
        const firstError = Object.values(errors).flat()[0];
        this.showSnackbar(firstError || response.statusMessage || 'Request failed');
      }
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

  private showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
