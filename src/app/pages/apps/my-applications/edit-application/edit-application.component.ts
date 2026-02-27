import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormArray,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApplicationItem, Application } from '../application';
import { ApplicationService } from 'src/app/services/apps/application/application.service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-application',
  templateUrl: './edit-application.component.html',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
})
export class AppEditApplicationComponent implements OnInit {
  editForm: UntypedFormGroup | any;
  rows: UntypedFormArray;
  application = signal<Application | undefined>(undefined);
  applicationId: number = 0;
  subTotal = signal(0);
  processingFee = signal(0);
  grandTotal = signal(0);

  serviceTypes = [
    'New Water Connection',
    'Meter Replacement',
    'Repair Request',
    'Billing Inquiry',
    'Account Update',
    'Service Disconnection',
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      serviceType: ['', Validators.required],
      applicantName: ['', Validators.required],
      applicantEmail: ['', [Validators.required, Validators.email]],
      applicantAddress: ['', Validators.required],
      applicantPhone: ['', Validators.required],
      businessName: [''],
      remarks: [''],
    });

    this.rows = this.fb.array([]);
    this.editForm.addControl('rows', this.rows);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.applicationId = +params['id'];
      const app = this.applicationService.getApplication(this.applicationId);
      if (app) {
        this.application.set(app);
        this.populateForm(app);
      }
    });
  }

  populateForm(app: Application): void {
    this.editForm.patchValue({
      serviceType: app.serviceType,
      applicantName: app.applicantName,
      applicantEmail: app.applicantEmail,
      applicantAddress: app.applicantAddress,
      applicantPhone: app.applicantPhone,
      businessName: app.businessName,
      remarks: app.remarks,
    });

    // Clear existing rows
    while (this.rows.length !== 0) {
      this.rows.removeAt(0);
    }

    // Add application items
    if (app.applicationItems && app.applicationItems.length > 0) {
      app.applicationItems.forEach((item) => {
        const itemGroup = this.createItemFormGroup();
        itemGroup.patchValue({
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        });
        this.rows.push(itemGroup);
      });
    } else {
      this.rows.push(this.createItemFormGroup());
    }

    this.updateTotalCost();
  }

  onAddRow(): void {
    this.rows.push(this.createItemFormGroup());
  }

  onRemoveRow(rowIndex: number): void {
    this.rows.removeAt(rowIndex);
    this.updateTotalCost();
  }

  createItemFormGroup(): UntypedFormGroup {
    return this.fb.group({
      itemName: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      totalPrice: [{ value: 0, disabled: true }],
    });
  }

  calculateTotalPrice(index: number): void {
    const row = this.rows.at(index);
    const quantity = row.get('quantity')?.value || 0;
    const unitPrice = row.get('unitPrice')?.value || 0;
    const totalPrice = quantity * unitPrice;
    row.get('totalPrice')?.setValue(totalPrice);
    this.updateTotalCost();
  }

  updateTotalCost(): void {
    let total = 0;
    this.rows.controls.forEach((row) => {
      total += row.get('totalPrice')?.value || 0;
    });
    this.subTotal.set(total);
    this.processingFee.set(total * 0.1); // 10% processing fee
    this.grandTotal.set(this.subTotal() + this.processingFee());
  }

  onSubmit(): void {
    if (this.editForm.valid && this.application()) {
      const formValue = this.editForm.getRawValue();
      const updatedApplication: Application = {
        id: this.applicationId,
        serviceType: formValue.serviceType,
        applicantName: formValue.applicantName,
        applicantEmail: formValue.applicantEmail,
        applicantAddress: formValue.applicantAddress,
        applicantPhone: formValue.applicantPhone,
        businessName: formValue.businessName,
        applicationItems: formValue.rows.map(
          (row: any) =>
            new ApplicationItem(
              row.itemName,
              row.description,
              row.quantity,
              row.unitPrice,
              row.totalPrice
            )
        ),
        applicationDate: this.application()!.applicationDate,
        totalCost: this.subTotal(),
        processingFee: this.processingFee(),
        grandTotal: this.grandTotal(),
        status: this.application()!.status,
        remarks: formValue.remarks,
        completed: this.application()!.completed,
        isSelected: this.application()!.isSelected,
      };

      this.applicationService.updateApplication(updatedApplication);
      this.showSnackbar('Application updated successfully!');
      this.router.navigate(['/apps/myApplications/list']);
    }
  }

  showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
