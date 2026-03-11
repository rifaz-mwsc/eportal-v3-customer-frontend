import { Component, signal, OnInit, ChangeDetectorRef, Inject, ViewChild } from '@angular/core';
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
import {MatStepperModule, MatStepper} from '@angular/material/stepper';
import { AuthService, UserProfile } from 'src/app/services/auth.service';
import { 
  ServiceRequestService, 
  ServiceRequestWithType,
  RequestPipelineStep,
  RequestPipelineStepDocument,
  Step1OwnerDetailsRequest,
  Step1Response,
  Step2ServiceAddressRequest,
  Step2Response,
  Step3ConnectionDetailsRequest,
  Step3Response,
  ConnectionItem,
  Step4Response,
  Step5DeclarationRequest,
  Step5Response
} from 'src/app/services/service-request.service';


@Component({
  selector: 'app-add-application',
  templateUrl: './add-application.component.html',
  styleUrls: ['./add-application.component.scss'],
  standalone: true,
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

  @ViewChild('stepper') stepper!: MatStepper;

  // Service information from route
  serviceId: string | null = null;
  serviceName: string | null = null;
  serviceDetails: ServiceRequestWithType | null = null;
  pipelineSteps: RequestPipelineStep[] = [];
  isLoadingService: boolean = false;
  
  // Request tracking
  requestTypeId: string | null = null;
  createdServiceRequestId: string | null = null;
  isSubmittingStep1: boolean = false;
  isSubmittingStep2: boolean = false;
  isSubmittingStep3: boolean = false;
  isSubmittingStep4: boolean = false;
  isSubmittingStep5: boolean = false;

  // User data
  userData: any = null;
  userProfiles: UserProfile[] = [];
  selectedProfile: UserProfile | null | string = null;

  // Owner checkbox - initialize as null so nothing is pre-selected
  isOwner: boolean | null = null;
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
    city: ['', Validators.required],
    buildingName: ['', Validators.required],
    houseNumber: ['', Validators.required],
    street: ['', Validators.required],
    postalCode: ['']
  });
  connectionDetailsFormGroup = this._formBuilder.group({
    floors: this._formBuilder.array([]) // Floors in separate form group for Connection Details step
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
    { name: 'Male', islandId: 1 },
    { name: 'Hulhumale', islandId: 2 },
    { name: 'Vilimale', islandId: 3 },
    { name: 'Thilafushi', islandId: 4 },
    { name: 'Gulhifalhu', islandId: 5 },
    { name: 'Addu City', islandId: 6 },
    { name: 'Fuvahmulah', islandId: 7 },
    { name: 'Kulhudhuffushi', islandId: 8 },
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
  createdRequestId: any;
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
      this.requestTypeId = params['requestTypeId'] || null;
      console.log('Service ID:', this.serviceId);
      console.log('Service Name:', this.serviceName);
      console.log('Request Type ID:', this.requestTypeId);
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

    // Initialize floors FormArray - it's part of connectionDetailsFormGroup
    this.floors = this.connectionDetailsFormGroup.get('floors') as UntypedFormArray;
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

    onSubmit1(): void {
       this.showSnackbar('Application submitted successfully!');
     this.router.navigate(['/apps/my-applications/list']);
  }

  /**
   * Submit Step 1 - Owner Details
   */
  submitStep1OwnerDetails(): void {
    if (!this.requestTypeId || !this.serviceId) {
      this.showSnackbar('Missing request type or service information');
      return;
    }

    // Validate that user has selected owner option
    if (this.isOwner === null) {
      this.showSnackbar('Please select whether you are the owner or not');
      return;
    }

    // Prepare the request data
    const requestData: Step1OwnerDetailsRequest = {
      requestTypeId: this.requestTypeId,
      serviceRequestId: this.createdServiceRequestId || this.serviceId,
      isOwner: this.isOwner
    };

    // If owner, use selected profile or current user data
    if (this.isOwner) {
      if (this.selectedProfile && typeof this.selectedProfile !== 'string') {
        requestData.profileId = this.selectedProfile.id;
        
        // Add profile data
        if (this.selectedProfile.profileType === 'Individual') {
          requestData.firstName = this.selectedProfile.firstName || undefined;
          requestData.lastName = this.selectedProfile.lastName || undefined;
          requestData.identificationNumber = this.selectedProfile.identityNumber || undefined;
          requestData.mobileNumber = this.selectedProfile.mobileNo || undefined;
          requestData.email = this.selectedProfile.email;
        } else {
          requestData.companyName = this.selectedProfile.entityName || undefined;
          requestData.registrationNumber = this.selectedProfile.registrationNumber || undefined;
          requestData.mobileNumber = this.selectedProfile.mobileNo || undefined;
          requestData.email = this.selectedProfile.email;
        }

        // Add address if available
        const address = this.selectedProfile.permanentAddress;
        if (address) {
          requestData.addressLine1 = address.addressLine1 || undefined;
          requestData.addressLine2 = address.addressLine2 || undefined;
          requestData.postalCode = address.postalCode || undefined;
          // Note: islandId needs to be mapped from island name if needed
        }
      }
    } else {
      // Not owner - check if manual entry or selected profile
      if (this.selectedProfile === 'other') {
        // Manual entry from otherProfile
        if (this.otherProfileType === 'individual') {
          requestData.firstName = this.otherProfile.name.split(' ')[0];
          requestData.lastName = this.otherProfile.name.split(' ').slice(1).join(' ');
          requestData.identificationNumber = this.otherProfile.idCardNo;
          requestData.mobileNumber = this.otherProfile.phone;
          requestData.email = this.otherProfile.email;
        } else {
          requestData.companyName = this.otherProfile.companyName;
          requestData.registrationNumber = this.otherProfile.registrationNo;
          requestData.mobileNumber = this.otherProfile.phone;
          requestData.email = this.otherProfile.email;
        }

        // Add address
        requestData.addressLine1 = this.otherProfile.street;
        requestData.addressLine2 = this.otherProfile.city;
        requestData.postalCode = this.otherProfile.postalCode;
      } else if (this.selectedProfile && typeof this.selectedProfile !== 'string') {
        // Selected from existing profiles
        requestData.profileId = this.selectedProfile.id;
        
        if (this.selectedProfile.profileType === 'Individual') {
          requestData.firstName = this.selectedProfile.firstName || undefined;
          requestData.lastName = this.selectedProfile.lastName || undefined;
          requestData.identificationNumber = this.selectedProfile.identityNumber || undefined;
        } else {
          requestData.companyName = this.selectedProfile.entityName || undefined;
          requestData.registrationNumber = this.selectedProfile.registrationNumber || undefined;
        }
        
        requestData.mobileNumber = this.selectedProfile.mobileNo || undefined;
        requestData.email = this.selectedProfile.email;

        const address = this.selectedProfile.permanentAddress;
        if (address) {
          requestData.addressLine1 = address.addressLine1 || undefined;
          requestData.addressLine2 = address.addressLine2 || undefined;
          requestData.postalCode = address.postalCode || undefined;
        }
      }
    }

    console.log('Submitting Step 1 with data:', requestData);
    this.isSubmittingStep1 = true;

    this.serviceRequestService.submitStep1OwnerDetails(requestData).subscribe({
      next: (response: Step1Response) => {
        this.isSubmittingStep1 = false;
        
        if (response.isSuccessful) {
          this.showSnackbar('Owner details submitted successfully!');
          // Store the created service request ID if returned
          if (response.item) {
            // Assuming the API might return the service request ID
            console.log('Step 1 completed successfully', response.item);
            this.createdRequestId = response.item
          }
          // Move to next step automatically
          if (this.stepper) {
            setTimeout(() => this.stepper.next(), 500);
          }
        } else {
          // Handle validation errors
          const errors = response.errorDetails;
          let errorMessage = response.statusMessage || 'Failed to submit owner details';
          
          if (errors && Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0];
            }
          }
          
          this.showSnackbar(errorMessage);
          console.error('Step 1 validation errors:', errors);
        }
      },
      error: (error) => {
        this.isSubmittingStep1 = false;
        console.error('Error submitting Step 1:', error);
        this.showSnackbar('An error occurred while submitting owner details');
      }
    });
  }

  /**
   * Submit Step 2 - Service Address
   */
  submitStep2ServiceAddress(): void {
    if (!this.serviceId) {
      this.showSnackbar('Missing service information');
      return;
    }

    // Validate that Step 1 was completed and we have a request ID
    if (!this.createdRequestId) {
      this.showSnackbar('Please complete Step 1 first');
      console.error('No created request ID available. Step 1 may not have been completed.');
      return;
    }

    // Validate the location form
    if (this.locationFormGroup.invalid) {
      this.showSnackbar('Please fill in all required fields');
      this.locationFormGroup.markAllAsTouched();
      return;
    }

    const formValue = this.locationFormGroup.value;

    // Get island ID from selected city
    const selectedCity = this.cities.find(city => city.name === formValue.city);
    const islandId = selectedCity?.islandId ?? 0;
    
    const requestData: Step2ServiceAddressRequest = {
      requestId: this.createdRequestId,
      buildingName: formValue.buildingName || '',
      houseNumber: formValue.houseNumber || '',
      street: formValue.street || '',
      postalCode: formValue.postalCode || undefined,
      islandId: islandId
    };

    console.log('Submitting Step 2 - Service Address:', requestData);

    this.isSubmittingStep2 = true;

    this.serviceRequestService.submitStep2ServiceAddress(requestData).subscribe({
      next: (response) => {
        this.isSubmittingStep2 = false;

        if (response.isSuccessful) {
          console.log('Step 2 submitted successfully:', response);
          this.showSnackbar('Service address saved successfully!');

          // Auto-advance to next step after a short delay
          if (this.stepper) {
            setTimeout(() => this.stepper.next(), 500);
          }
        } else {
          // Handle validation errors
          const errors = response.errorDetails;
          const firstErrorKey = Object.keys(errors)[0];
          const firstErrorMessage = errors[firstErrorKey]?.[0] || response.statusMessage;
          
          this.showSnackbar(`Failed to save service address: ${firstErrorMessage}`);
          console.error('Step 2 validation errors:', errors);
        }
      },
      error: (error) => {
        this.isSubmittingStep2 = false;
        console.error('Error submitting Step 2:', error);
        this.showSnackbar('An error occurred while submitting service address');
      }
    });
  }

  /**
   * Submit Step 3 - Connection Details
   */
  submitStep3ConnectionDetails(): void {
    if (!this.serviceId) {
      this.showSnackbar('Missing service information');
      return;
    }

    // Validate the connection details form
    if (this.connectionDetailsFormGroup.invalid) {
      this.showSnackbar('Please fill in all required fields');
      this.connectionDetailsFormGroup.markAllAsTouched();
      return;
    }

    // Validate that at least one floor with meters exists
    if (this.floors.length === 0) {
      this.showSnackbar('Please add at least one floor with meters');
      return;
    }

    // Check if service detail indicates new connection
    const isNewConnection = this.serviceDetails?.isNewConnection ?? true;

    // Build connection items from floors
    const connectionItems: ConnectionItem[] = [];
    
    this.floors.controls.forEach((floorControl: any, floorIndex: number) => {
      const meters = this.getFloorMeters(floorIndex);
      
      meters.controls.forEach((meterControl: any) => {
        const tarrifType = meterControl.get('tarrifType')?.value;
        const quantity = meterControl.get('quantity')?.value || 1;
        
        // Map tariff type to tariff group ID
        // TODO: This mapping should come from API or configuration
        const tarrifGroupId = this.getTarrifGroupId(tarrifType);
        
        // Floor ID - using index + 1 for now
        // TODO: If floors have IDs from API, use those instead
        const floorId = floorIndex + 1;
        
        connectionItems.push({
          quantity: quantity,
          floorId: floorId,
          tarrifGroupId: tarrifGroupId,
          meterNo: '' // Empty for new connections
        });
      });
    });

    if (connectionItems.length === 0) {
      this.showSnackbar('Please add at least one meter');
      return;
    }

    const requestData: Step3ConnectionDetailsRequest = {
      requestId: this.createdRequestId,
      isNewConnection: false, // Assuming this is always false for now since we're adding meters to an existing connection. Update as needed.
      // isNewConnection: isNewConnection,
      connectionItems: connectionItems
    };

    console.log('Submitting Step 3 - Connection Details:', requestData);
    this.isSubmittingStep3 = true;

    this.serviceRequestService.submitStep3ConnectionDetails(requestData).subscribe({
      next: (response) => {
        this.isSubmittingStep3 = false;

        if (response.isSuccessful) {
          console.log('Step 3 submitted successfully:', response);
          this.showSnackbar('Connection details saved successfully!');

          // Auto-advance to next step after a short delay
          if (this.stepper) {
            setTimeout(() => this.stepper.next(), 500);
          }
        } else {
          // Handle validation errors
          const errors = response.errorDetails;
          let errorMessage = response.statusMessage || 'Failed to save connection details';
          
          if (errors && Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorKey]?.[0];
            if (firstErrorMessage) {
              errorMessage = firstErrorMessage;
            }
          }
          
          this.showSnackbar(`Failed to save connection details: ${errorMessage}`);
          console.error('Step 3 validation errors:', errors);
        }
      },
      error: (error) => {
        this.isSubmittingStep3 = false;
        console.error('Error submitting Step 3:', error);
        this.showSnackbar('An error occurred while submitting connection details');
      }
    });
  }

  /**
   * Map tariff type name to tariff group ID
   * TODO: Get this mapping from API or configuration
   */
  getTarrifGroupId(tarrifType: string): number {
    const mapping: { [key: string]: number } = {
      'Domestic': 1,
      'Commercial': 2,
      'Institutional': 3
    };
    return mapping[tarrifType] || 1;
  }

  /**
   * Submit Step 4 - Documents (Placeholder)
   * Note: This is a placeholder call as the actual file upload API is not ready yet.
   * It will display the backend message to the user.
   */
  submitStep4Documents(): void {
    console.log('Step 4 - Documents submission initiated (placeholder)');
    this.isSubmittingStep4 = true;

    this.serviceRequestService.submitStep4Documents().subscribe({
      next: (response) => {
        this.isSubmittingStep4 = false;
        console.log('Step 4 response:', response);

        // Show the backend message to the user
        this.showSnackbar(response.message || 'Documents step acknowledged');

        // Auto-advance to next step if status is Success
        if (response.status === 'Success' && this.stepper) {
          setTimeout(() => {
            this.stepper.next();
          }, 1000);
        }
      },
      error: (error) => {
        this.isSubmittingStep4 = false;
        console.error('Step 4 error:', error);
        this.showSnackbar('Error calling document API. Please try again.');
      }
    });
  }

  /**
   * Submit Step 5 - Declaration
   */
  submitStep5Declaration(): void {
    if (!this.serviceId) {
      this.showSnackbar('Missing service information');
      return;
    }

    // Check if declaration is agreed
    if (!this.declarationAgreed) {
      this.showSnackbar('Please accept the declaration to proceed');
      return;
    }

    // Get declaration ID from pipeline steps
    const declarationStep = this.pipelineSteps.find(
      step => step.pipelineStepType === 'Declaration'
    );

    if (!declarationStep) {
      this.showSnackbar('Declaration information not found');
      return;
    }

    const requestData: Step5DeclarationRequest = {
      requestId: this.createdRequestId,
      // declarationId: declarationStep.stepKey || this.serviceId, // Use stepKey or fallback to serviceId
      declarationId: "A9C71C2F-5C76-4FA2-B2D4-A4A23A4CFA71", // Use stepKey or fallback to serviceId
      isAccepted: this.declarationAgreed
    };

    console.log('Submitting Step 5 - Declaration:', requestData);
    this.isSubmittingStep5 = true;

    this.serviceRequestService.submitStep5Declaration(requestData).subscribe({
      next: (response) => {
        this.isSubmittingStep5 = false;

        if (response.isSuccessful) {
          console.log('Step 5 submitted successfully:', response);
          this.showSnackbar('Application submitted successfully! 🎉');

          // Navigate to applications list or success page
          setTimeout(() => {
            this.router.navigate(['/apps/my-applications/list']);
          }, 1500);
        } else {
          // Handle validation errors
          const errors = response.errorDetails;
          let errorMessage = response.statusMessage || 'Failed to submit declaration';
          
          if (errors && Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorKey]?.[0];
            if (firstErrorMessage) {
              errorMessage = firstErrorMessage;
            }
          }
          
          this.showSnackbar(`Failed to submit application: ${errorMessage}`);
          console.error('Step 5 validation errors:', errors);
        }
      },
      error: (error) => {
        this.isSubmittingStep5 = false;
        console.error('Error submitting Step 5:', error);
        this.showSnackbar('An error occurred while submitting the application');
      }
    });
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
