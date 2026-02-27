import { Component, signal } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
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
export class AppAddApplicationComponent {
  addForm: UntypedFormGroup | any;
  rows: UntypedFormArray;
  application = signal<Application | any>(new Application());
  subTotal = signal(0);
  processingFee = signal(0);
  grandTotal = signal(0);
  today = new Date();

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
    private applicationService: ApplicationService,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    const maxId = Math.max(
      ...this.applicationService.getApplications().map((o) => o.id),
      0
    );
    this.application.set({
      id: maxId + 1,
      status: 'Pending',
      applicationItems: [],
      applicationDate: new Date(),
    });

    this.addForm = this.fb.group({
      serviceType: ['', Validators.required],
      applicantName: ['', Validators.required],
      applicantEmail: ['', [Validators.required, Validators.email]],
      applicantAddress: ['', Validators.required],
      applicantPhone: ['', Validators.required],
      businessName: [''],
      remarks: [''],
    });

    this.rows = this.fb.array([]);
    this.addForm.addControl('rows', this.rows);
    this.rows.push(this.createItemFormGroup());
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
    if (this.addForm.valid) {
      const formValue = this.addForm.getRawValue();
      const newApplication: Application = {
        id: this.application().id,
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
        applicationDate: new Date(),
        totalCost: this.subTotal(),
        processingFee: this.processingFee(),
        grandTotal: this.grandTotal(),
        status: 'Pending',
        remarks: formValue.remarks,
        completed: false,
        isSelected: false,
      };

      this.applicationService.addApplication(newApplication);
      this.showSnackbar('Application submitted successfully!');
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
