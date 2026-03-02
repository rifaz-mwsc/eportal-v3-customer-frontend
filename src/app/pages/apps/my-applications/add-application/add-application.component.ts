import { Component, signal, OnInit } from '@angular/core';
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
import { inject} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import { AuthService, UserProfile } from 'src/app/services/auth.service';


@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  standalone: true,
  styles: [`
    .stepper-container {
      padding: 0;
      margin: 0;
    }
    
    ::ng-deep .mat-stepper-horizontal {
      background: transparent;
    }
    
    ::ng-deep .mat-horizontal-stepper-header-container {
      padding: 0 24px;
      margin-bottom: 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    ::ng-deep .mat-horizontal-stepper-header {
      padding: 16px 24px !important;
    }
    
    ::ng-deep .mat-step-header .mat-step-icon-selected,
    ::ng-deep .mat-step-header .mat-step-icon-state-edit {
      background-color: var(--primary-color, #5D87FF);
    }
    
    ::ng-deep .mat-horizontal-content-container {
      padding: 0 !important;
    }
  `],
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
        MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class AppAddApplicationComponent implements OnInit {
      private _formBuilder = inject(FormBuilder);

  // User data
  userData: any = null;
  userProfiles: UserProfile[] = [];
  selectedProfile: UserProfile | null | string = null;

  // Owner checkbox
  isOwner: boolean = false;
  isNotOwner: boolean = false;

  // Other profile data
  otherProfileType: 'individual' | 'company' = 'individual';
  otherProfile = {
    name: '',
    phone: '',
    email: '',
    idCardNo: '',
    companyName: '',
    registrationNo: '',
    addressName: '',
    street: '',
    city: '',
    postalCode: '',
  };

  ownerFormGroup = this._formBuilder.group({
    ownerCtrl: [''],
  });
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  locationFormGroup = this._formBuilder.group({
    region: ['', Validators.required],
    city: ['', Validators.required],
    buildingName: ['', Validators.required],
    street: ['', Validators.required],
  });
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

  regions = [
    'Male Region',
    'North Region',
    'South Region',
    'Central Region',
    'Upper North Region',
    'Upper South Region',
  ];

  cities = [
    'Male',
    'Hulhumale',
    'Vilimale',
    'Thilafushi',
    'Gulhifalhu',
    'Addu City',
    'Fuvahmulah',
    'Kulhudhuffushi',
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private applicationService: ApplicationService,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
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

  ngOnInit(): void {
    this.loadUserData();
  }

  /**
   * Load user data and profiles from AuthService
   */
  loadUserData(): void {
    this.userData = this.authService.getUserData();
    
    if (this.userData && this.userData.userProfiles) {
      this.userProfiles = this.userData.userProfiles;
      
      // Set default profile as selected
      const defaultProfile = this.userProfiles.find(p => p.isDefault);
      this.selectedProfile = defaultProfile || this.userProfiles[0] || null;
    }
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
