import { Component, signal, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
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
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
import { 
  ServiceRequestService, 
  ServiceRequestWithType,
  RequestPipelineStep,
  RequestPipelineStepDocument 
} from 'src/app/services/service-request.service';


@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  standalone: true,
  styles: [`
    /* Application Header Styles */
    .application-header {
      background: linear-gradient(135deg, #5D87FF 0%, #4570EA 100%);
      padding: 24px 32px;
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(93, 135, 255, 0.25);
      position: relative;
      overflow: hidden;
    }
    
    .application-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      pointer-events: none;
    }
    
    .application-header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -5%;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      pointer-events: none;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .icon-wrapper {
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .header-text {
      flex: 1;
      min-width: 0;
    }
    
    .header-label {
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .header-title {
      color: white;
      line-height: 1.3;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header-badge {
      flex-shrink: 0;
    }
    
    .badge-content {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      color: white;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Mobile responsive styles for header */
    @media (max-width: 767px) {
      .application-header {
        padding: 20px 20px;
        margin-bottom: 16px;
        border-radius: 8px;
      }
      
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .icon-wrapper {
        width: 48px;
        height: 48px;
      }
      
      .header-title {
        font-size: 18px;
      }
      
      .header-label {
        font-size: 11px;
      }
      
      .badge-content {
        font-size: 12px;
        padding: 6px 12px;
      }
      
      .application-header::before,
      .application-header::after {
        display: none;
      }
    }
    
    @media (max-width: 479px) {
      .application-header {
        padding: 16px;
      }
      
      .icon-wrapper {
        width: 44px;
        height: 44px;
      }
      
      .header-title {
        font-size: 16px;
      }
    }
    
    .stepper-container {
      padding: 0;
      margin: 0;
      min-height: calc(100vh - 200px);
    }
    
    /* Base stepper styles */
    ::ng-deep .mat-stepper-horizontal {
      background: transparent;
      border-radius: 0;
    }
    
    /* Header container with responsive padding */
    ::ng-deep .mat-horizontal-stepper-header-container {
      padding: 16px 24px;
      margin-bottom: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: box-shadow 0.3s ease;
    }
    
    ::ng-deep .mat-horizontal-stepper-header-container:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
    
    /* Individual step header */
    ::ng-deep .mat-horizontal-stepper-header {
      padding: 12px 16px !important;
      height: auto;
      transition: all 0.3s ease;
    }
    
    /* Step icon styling */
    ::ng-deep .mat-step-header .mat-step-icon {
      width: 36px;
      height: 36px;
      transition: all 0.3s ease;
    }
    
    ::ng-deep .mat-step-header .mat-step-icon-selected,
    ::ng-deep .mat-step-header .mat-step-icon-state-edit {
      background-color: var(--primary-color, #5D87FF);
      box-shadow: 0 2px 6px rgba(93, 135, 255, 0.3);
    }
    
    ::ng-deep .mat-step-header .mat-step-icon-state-done {
      background-color: #13DEB9;
      box-shadow: 0 2px 6px rgba(19, 222, 185, 0.3);
    }
    
    /* Step label text */
    ::ng-deep .mat-step-label {
      font-size: 14px;
      font-weight: 500;
      min-width: 80px;
    }
    
    ::ng-deep .mat-step-label-selected {
      font-weight: 600;
      color: var(--primary-color, #5D87FF);
    }
    
    /* Step connector line */
    ::ng-deep .mat-stepper-horizontal-line {
      margin: 0 8px;
      border-top-width: 2px;
    }
    
    /* Content container */
    ::ng-deep .mat-horizontal-content-container {
      padding: 0 !important;
      overflow: visible;
    }
    
    /* Mobile responsive styles */
    @media (max-width: 959px) {
      ::ng-deep .mat-horizontal-stepper-header-container {
        padding: 12px 16px;
        margin-bottom: 16px;
        border-radius: 8px;
      }
      
      ::ng-deep .mat-horizontal-stepper-header {
        padding: 8px 12px !important;
      }
      
      ::ng-deep .mat-step-header .mat-step-icon {
        width: 32px;
        height: 32px;
        margin-right: 8px;
      }
      
      ::ng-deep .mat-step-label {
        font-size: 13px;
        min-width: 60px;
      }
      
      ::ng-deep .mat-stepper-horizontal-line {
        margin: 0 4px;
      }
    }
    
    @media (max-width: 599px) {
      .stepper-container {
        padding: 0;
      }
      
      ::ng-deep .mat-horizontal-stepper-header-container {
        padding: 8px 12px;
        margin-bottom: 12px;
        border-radius: 8px;
        overflow-x: auto;
        scrollbar-width: thin;
      }
      
      ::ng-deep .mat-horizontal-stepper-header {
        padding: 6px 8px !important;
        min-width: fit-content;
      }
      
      ::ng-deep .mat-step-header .mat-step-icon {
        width: 28px;
        height: 28px;
        margin-right: 6px;
        flex-shrink: 0;
      }
      
      ::ng-deep .mat-step-label {
        font-size: 12px;
        min-width: 50px;
        white-space: nowrap;
      }
      
      ::ng-deep .mat-step-text-label {
        display: none;
      }
      
      ::ng-deep .mat-stepper-horizontal-line {
        margin: 0 2px;
        min-width: 20px;
      }
      
      /* Show only step numbers on very small screens */
      ::ng-deep .mat-step-label-selected .mat-step-text-label {
        display: inline;
        font-size: 11px;
      }
    }
    
    /* Accessibility improvements */
    ::ng-deep .mat-step-header:focus {
      outline: 2px solid var(--primary-color, #5D87FF);
      outline-offset: 2px;
      border-radius: 8px;
    }
    
    /* Loading and disabled states */
    ::ng-deep .mat-step-header[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Smooth transitions for interactive elements */
    ::ng-deep .mat-step-header:not([aria-disabled="true"]):hover {
      background-color: rgba(93, 135, 255, 0.04);
      border-radius: 8px;
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
  private serviceRequestService = inject(ServiceRequestService);

  // Service information from route
  serviceId: string | null = null;
  serviceName: string | null = null;
  serviceDetails: ServiceRequestWithType | null = null;
  pipelineSteps: RequestPipelineStep[] = [];
  isLoadingService: boolean = false;

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
    region: ['Male Region', Validators.required],
    city: ['Hulhumale', Validators.required],
    buildingName: ['Test Building', Validators.required],
    street: ['Main Street', Validators.required],
    floors: this.fb.array([]) // Dynamic floors array
  });
  addForm: UntypedFormGroup | any;
  rows: UntypedFormArray;
  connections: UntypedFormArray;
  floors: UntypedFormArray;
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
  tarrifTypes: string[] = ['Commercial', 'Institutional', 'Domestic'];
  
  // Required documents list (will come from API later)
  requiredDocuments: Array<{
    id: number;
    name: string;
    required: boolean;
    file: File | null;
    uploaded: boolean;
  }> = [
    { id: 1, name: 'National ID Card', required: true, file: null, uploaded: false },
    { id: 2, name: 'Proof of Ownership (Title Deed)', required: true, file: null, uploaded: false },
    { id: 3, name: 'Building Plan Approval', required: true, file: null, uploaded: false },
    { id: 4, name: 'Tax Identification Number (TIN)', required: false, file: null, uploaded: false },
    { id: 5, name: 'Business Registration Certificate', required: false, file: null, uploaded: false },
    { id: 6, name: 'Authorization Letter (if applicable)', required: false, file: null, uploaded: false },
  ];

  toggleValue: any = null;
  quantity: number = 1;
declarationAgreed: any;
  constructor(
    private fb: UntypedFormBuilder,
    private applicationService: ApplicationService,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    // Get service information from query parameters
    this.activatedRoute.queryParams.subscribe(params => {
      this.serviceId = params['serviceId'] || null;
      this.serviceName = params['serviceName'] || null;
      console.log('Service ID:', this.serviceId);
      console.log('Service Name:', this.serviceName);
    });

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

    // Initialize connections FormArray
    this.connections = this.fb.array([]);
    this.addForm.addControl('connections', this.connections);
    this.connections.push(this.createConnectionFormGroup());

    // Initialize floors FormArray with one default floor
    this.floors = this.locationFormGroup.get('floors') as UntypedFormArray;
    this.addFloor(); // Add first floor by default
  }

  ngOnInit(): void {
    this.loadUserData();
    if (this.serviceId) {
      this.loadServicePipelineSteps();
    }
  }

  /**
   * Load pipeline steps for the selected service
   */
  loadServicePipelineSteps(): void {
    if (!this.serviceId) {
      console.error('No service ID provided');
      return;
    }

    this.isLoadingService = true;

    // Fetch service details
    this.serviceRequestService.getServiceRequestById(this.serviceId).subscribe({
      next: (service) => {
        if (service) {
          // Get full service details with UI properties
          this.serviceRequestService.getAllServiceRequestsWithType().subscribe({
            next: (allServices) => {
              const fullService = allServices.find(s => s.id === this.serviceId);
              if (fullService) {
                this.serviceDetails = fullService;
                this.serviceName = fullService.name;
                console.log('Service details loaded:', fullService);
              }
            },
            error: (error) => {
              console.error('Error loading full service details:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading service:', error);
        this.isLoadingService = false;
      }
    });

    // Fetch pipeline steps
    this.serviceRequestService.getPipelineSteps(this.serviceId).subscribe({
      next: (steps) => {
        this.pipelineSteps = steps;
        this.isLoadingService = false;
        console.log('Pipeline steps loaded:', steps);
        console.log('Total steps:', steps.length);
        
        // Log step details
        steps.forEach((step, index) => {
          console.log(`Step ${index + 1}: ${step.title} (${step.pipelineStepType})`);
          if (step.pipelineStepType === 'DocumentUpload') {
            console.log('  Required documents:', step.requestPipelineStepDocuments);
          }
        });

        // Update required documents from API
        this.updateRequiredDocumentsFromPipeline();
      },
      error: (error) => {
        console.error('Error loading pipeline steps:', error);
        this.isLoadingService = false;
      }
    });
  }

  /**
   * Update required documents list from pipeline steps
   */
  updateRequiredDocumentsFromPipeline(): void {
    const documentSteps = this.pipelineSteps.filter(
      step => step.pipelineStepType === 'DocumentUpload'
    );

    if (documentSteps.length > 0) {
      this.requiredDocuments = [];
      let documentId = 1;

      documentSteps.forEach(step => {
        step.requestPipelineStepDocuments.forEach(doc => {
          this.requiredDocuments.push({
            id: documentId++,
            name: doc.documentType,
            required: doc.isRequired,
            file: null,
            uploaded: false
          });
        });
      });

      console.log('Required documents updated from API:', this.requiredDocuments);
    }
  }

  /**
   * Get step by step key
   */
  getStepByKey(stepKey: string): RequestPipelineStep | undefined {
    return this.pipelineSteps.find(step => step.stepKey === stepKey);
  }

  /**
   * Check if a specific step type is required
   */
  isStepRequired(stepKey: string): boolean {
    const step = this.getStepByKey(stepKey);
    return step?.isRequired || false;
  }

  /**
   * Get steps by type
   */
  getStepsByType(type: 'FormSection' | 'DocumentUpload' | 'Declaration'): RequestPipelineStep[] {
    return this.pipelineSteps.filter(step => step.pipelineStepType === type);
  }

  /**
   * Get declaration content
   */
  getDeclarationContent(): string | null {
    const declarationStep = this.pipelineSteps.find(
      step => step.pipelineStepType === 'Declaration'
    );
    return declarationStep?.declarationContent || null;
  }
  increaseQty() {
    this.quantity++;
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  openMeterDialog(action: string, obj: any): void {
    // Removed - using openEditMeterDialog instead
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
      
      // Manually trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
      this.cdr.detectChanges();
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

  /**
   * Create a new connection form group
   */
  createConnectionFormGroup(): UntypedFormGroup {
    return this.fb.group({
      tarrifType: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  /**
   * Add a new connection row
   */
  onAddConnection(): void {
    this.connections.push(this.createConnectionFormGroup());
  }

  /**
   * Remove a connection row
   */
  onRemoveConnection(index: number): void {
    if (this.connections.length > 1) {
      this.connections.removeAt(index);
    }
  }

  /**
   * Increase quantity for a specific connection
   */
  increaseConnectionQty(index: number): void {
    const connection = this.connections.at(index);
    const currentQty = connection.get('quantity')?.value || 1;
    connection.get('quantity')?.setValue(currentQty + 1);
  }

  /**
   * Decrease quantity for a specific connection
   */
  decreaseConnectionQty(index: number): void {
    const connection = this.connections.at(index);
    const currentQty = connection.get('quantity')?.value || 1;
    if (currentQty > 1) {
      connection.get('quantity')?.setValue(currentQty - 1);
    }
  }

  // ===== FLOOR & METER MANAGEMENT METHODS =====

  /**
   * Create a floor form group with meters array
   */
  createFloorFormGroup(): UntypedFormGroup {
    return this.fb.group({
      floorNumber: ['', Validators.required],
      meters: this.fb.array([this.createMeterFormGroup()]) // Start with one meter
    });
  }

  /**
   * Create a meter form group
   */
  createMeterFormGroup(): UntypedFormGroup {
    return this.fb.group({
      tarrifType: ['Domestic', Validators.required], // Default to Domestic
      quantity: [1, [Validators.required, Validators.min(1)]] // Default quantity is 1
    });
  }

  /**
   * Add a new floor
   */
  addFloor(): void {
    this.floors.push(this.createFloorFormGroup());
  }

  /**
   * Remove a floor
   */
  removeFloor(floorIndex: number): void {
    if (this.floors.length > 1) {
      this.floors.removeAt(floorIndex);
    }
  }

  /**
   * Get meters FormArray for a specific floor
   */
  getFloorMeters(floorIndex: number): UntypedFormArray {
    return this.floors.at(floorIndex).get('meters') as UntypedFormArray;
  }

  /**
   * Add a meter to a specific floor
   */
  addMeterToFloor(floorIndex: number): void {
    const meters = this.getFloorMeters(floorIndex);
    
    // Check if all tariff types are already used
    const usedTariffTypes = this.getUsedTariffTypes(floorIndex);
    const availableTariffTypes = this.tarrifTypes.filter(type => !usedTariffTypes.includes(type));
    
    if (availableTariffTypes.length === 0) {
      this.snackBar.open('All tariff types are already added to this floor', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }
    
    // Create new meter with first available tariff type (prefer Domestic if available)
    const newMeter = this.createMeterFormGroup();
    const defaultType = availableTariffTypes.includes('Domestic') 
      ? 'Domestic' 
      : availableTariffTypes[0];
    newMeter.get('tarrifType')?.setValue(defaultType);
    
    meters.push(newMeter);
  }

  /**
   * Check if can add more meters to a floor
   */
  canAddMoreMeters(floorIndex: number): boolean {
    const usedTariffTypes = this.getUsedTariffTypes(floorIndex);
    return usedTariffTypes.length < this.tarrifTypes.length;
  }

  /**
   * Get list of tariff types already used in a floor
   */
  getUsedTariffTypes(floorIndex: number): string[] {
    const meters = this.getFloorMeters(floorIndex);
    const usedTypes: string[] = [];
    
    for (let i = 0; i < meters.length; i++) {
      const tarrifType = meters.at(i).get('tarrifType')?.value;
      if (tarrifType) {
        usedTypes.push(tarrifType);
      }
    }
    
    return usedTypes;
  }

  /**
   * Get available tariff types for a floor (excluding already used ones)
   */
  getAvailableTariffTypes(floorIndex: number, currentMeterIndex?: number): string[] {
    const usedTypes = this.getUsedTariffTypes(floorIndex);
    
    // If editing an existing meter, allow its current type
    if (currentMeterIndex !== undefined) {
      const currentType = this.getFloorMeters(floorIndex).at(currentMeterIndex).get('tarrifType')?.value;
      return this.tarrifTypes.filter(type => type === currentType || !usedTypes.includes(type));
    }
    
    return this.tarrifTypes.filter(type => !usedTypes.includes(type));
  }

  /**
   * Remove a meter from a specific floor
   */
  removeMeterFromFloor(floorIndex: number, meterIndex: number): void {
    const meters = this.getFloorMeters(floorIndex);
    if (meters.length > 1) {
      meters.removeAt(meterIndex);
    }
  }

  /**
   * Increase meter quantity
   */
  increaseMeterQty(floorIndex: number, meterIndex: number): void {
    const meters = this.getFloorMeters(floorIndex);
    const meter = meters.at(meterIndex);
    const currentQty = meter.get('quantity')?.value || 1;
    meter.get('quantity')?.setValue(currentQty + 1);
  }

  /**
   * Decrease meter quantity
   */
  decreaseMeterQty(floorIndex: number, meterIndex: number): void {
    const meters = this.getFloorMeters(floorIndex);
    const meter = meters.at(meterIndex);
    const currentQty = meter.get('quantity')?.value || 1;
    if (currentQty > 1) {
      meter.get('quantity')?.setValue(currentQty - 1);
    }
  }

  /**
   * Open dialog to edit meter details
   */
  openEditMeterDialog(floorIndex: number, meterIndex: number): void {
    const meters = this.getFloorMeters(floorIndex);
    const meter = meters.at(meterIndex);
    
    // Get available tariff types (excluding already used ones, but including current one)
    const availableTariffTypes = this.getAvailableTariffTypes(floorIndex, meterIndex);
    
    const dialogRef = this.dialog.open(EditMeterDialogComponent, {
      width: '500px',
      data: {
        tarrifType: meter.get('tarrifType')?.value,
        quantity: meter.get('quantity')?.value,
        tarrifTypes: availableTariffTypes
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Validate that the selected type is not already used by another meter in the same floor
        const usedTypes = this.getUsedTariffTypes(floorIndex);
        const currentType = meter.get('tarrifType')?.value;
        
        // If changing to a different type, check if it's already used
        if (result.tarrifType !== currentType && usedTypes.includes(result.tarrifType)) {
          this.snackBar.open('This tariff type is already added to this floor', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          return;
        }
        
        meter.get('tarrifType')?.setValue(result.tarrifType);
        meter.get('quantity')?.setValue(result.quantity);
      }
    });
  }

  /**
   * Get meter details for card display
   */
  getMeterDetails(floorIndex: number, meterIndex: number): { tarrifType: string; quantity: number } {
    const meters = this.getFloorMeters(floorIndex);
    const meter = meters.at(meterIndex);
    return {
      tarrifType: meter.get('tarrifType')?.value || 'Not Set',
      quantity: meter.get('quantity')?.value || 1
    };
  }

  /**
   * Get total meter count across all floors
   */
  getTotalMeterCount(): number {
    let total = 0;
    this.floors.controls.forEach((floor: any) => {
      const meters = floor.get('meters') as UntypedFormArray;
      meters.controls.forEach((meter: any) => {
        total += meter.get('quantity')?.value || 0;
      });
    });
    return total;
  }

  // ===== DOCUMENT UPLOAD METHODS =====

  /**
   * Handle file selection for a document
   */
  onFileSelected(event: any, documentId: number): void {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showSnackbar('File size must be less than 5MB');
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.showSnackbar('Only PDF, JPG, JPEG, and PNG files are allowed');
        return;
      }

      const document = this.requiredDocuments.find(doc => doc.id === documentId);
      if (document) {
        document.file = file;
        document.uploaded = true;
      }
    }
  }

  /**
   * Remove uploaded file
   */
  removeFile(documentId: number): void {
    const document = this.requiredDocuments.find(doc => doc.id === documentId);
    if (document) {
      document.file = null;
      document.uploaded = false;
    }
  }

  /**
   * Get file name
   */
  getFileName(documentId: number): string {
    const document = this.requiredDocuments.find(doc => doc.id === documentId);
    return document?.file?.name || '';
  }

  /**
   * Get file size in readable format
   */
  getFileSize(documentId: number): string {
    const document = this.requiredDocuments.find(doc => doc.id === documentId);
    if (document?.file) {
      const bytes = document.file.size;
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    return '';
  }

  /**
   * Check if all required documents are uploaded
   */
  areRequiredDocumentsUploaded(): boolean {
    return this.requiredDocuments
      .filter(doc => doc.required)
      .every(doc => doc.uploaded);
  }

  /**
   * Get upload progress
   */
  getUploadProgress(): { uploaded: number; total: number; percentage: number } {
    const required = this.requiredDocuments.filter(doc => doc.required);
    const uploaded = required.filter(doc => doc.uploaded).length;
    const total = required.length;
    const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;
    return { uploaded, total, percentage };
  }

  /**
   * Validate Step 2 (Location and Meters)
   */
  isStep2Valid(): boolean {
    // Check basic location fields
    const locationValid = this.locationFormGroup.get('region')?.valid &&
                         this.locationFormGroup.get('city')?.valid &&
                         this.locationFormGroup.get('buildingName')?.valid &&
                         this.locationFormGroup.get('street')?.valid;

    // Check if at least one floor exists
    if (this.floors.length === 0) {
      return false;
    }

    // Check if all floors have valid data
    let floorsValid = true;
    this.floors.controls.forEach((floor: any) => {
      // Check floor number
      if (!floor.get('floorNumber')?.value || floor.get('floorNumber')?.value.trim() === '') {
        floorsValid = false;
      }

      // Check meters in this floor
      const meters = floor.get('meters') as UntypedFormArray;
      if (meters.length === 0) {
        floorsValid = false;
      }

      meters.controls.forEach((meter: any) => {
        if (!meter.get('tarrifType')?.value || !meter.get('quantity')?.value) {
          floorsValid = false;
        }
      });
    });

    return !!locationValid && floorsValid;
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
    onSubmit1(): void {
       this.showSnackbar('Application submitted successfully!');
     this.router.navigate(['/apps/my-applications/list']);
  }

  showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}

// ===== EDIT METER DIALOG COMPONENT =====
@Component({
  selector: 'app-edit-meter-dialog',
  standalone: true,
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TablerIconsModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Meter Details</h2>
    <mat-dialog-content class="p-24">
      <div class="m-b-16">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Select Tariff Type</mat-label>
          <mat-select [(ngModel)]="data.tarrifType" required>
            @for (type of data.tarrifTypes; track type) {
              <mat-option [value]="type">{{ type }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
      <div class="d-flex align-items-center m-b-30">
        <label class="f-s-16 f-w-600">QTY:</label>

        <mat-button-toggle-group
          #toggleGroup="matButtonToggleGroup"
          class="border-style m-x-20"
          
          multiple
        >
          <mat-button-toggle
            (click)="decreaseQty();"
            disableRipple
          >
            -
          </mat-button-toggle>
          <mat-button-toggle  disableRipple >
            {{ data.quantity }}
          </mat-button-toggle>
          <mat-button-toggle
            (click)="increaseQty();"
            disableRipple
          >
            +
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>
      <mat-divider></mat-divider>

      <!-- <div class="m-b-16">
        <mat-label class="f-s-14 f-w-600 m-b-8 d-block">Quantity *</mat-label>
        <div class="d-flex align-items-center gap-16">
          <button mat-icon-button (click)="decreaseQty()" [disabled]="data.quantity <= 1">
            <i-tabler name="minus" class="icon-20"></i-tabler>
          </button>
          <mat-form-field appearance="outline" style="width: 100px;">
            <input matInput type="number" [(ngModel)]="data.quantity" min="1" required />
          </mat-form-field>
          <button mat-icon-button (click)="increaseQty()">
            <i-tabler name="plus" class="icon-20"></i-tabler>
          </button>
        </div>
      </div> -->
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="p-16 m-t-10">
      <button mat-flat-button class="bg-error text-white" (click)="onCancel()">Cancel</button>
      <button mat-flat-button class="bg-success text-white" (click)="onSave()" [disabled]="!data.tarrifType || data.quantity < 1">
        Save Changes
      </button>
    </mat-dialog-actions>

  `
})
export class EditMeterDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditMeterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  increaseQty(): void {
    this.data.quantity++;
  }

  decreaseQty(): void {
    if (this.data.quantity > 1) {
      this.data.quantity--;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data);
  }
}
