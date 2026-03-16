import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';


import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { MaterialModule } from 'src/app/material.module';
import { IconModule } from 'src/app/icon/icon.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { Post } from 'src/app/data-types/post.model';
// import { mockPosts } from 'src/app/data-types/mock-posts';
import { normalizeReplies } from 'src/app/utils/normalize-replies.util';
import { mockPosts, Post, topcards } from '../profileData';
import { AuthService } from 'src/app/services/auth.service';

// interface topcards {
//   img: string;
// }


@Component({
  selector: 'app-profile',
  imports: [MaterialModule, IconModule, CommonModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
  // User data from auth service
  userData: any = null;
  
  // Cached user properties (to avoid recalculation on every change detection)
  userAddress: any = null;
  
  constructor(private sanitizer: DomSanitizer) {}
  topcards = topcards;
  posts: Post[] = mockPosts;
  transformedPosts: Post[] = [];
  
  ngOnInit(): void {
    this.groupImages();
    this.posts = normalizeReplies(mockPosts);
    this.loadUserData();
  }
  
  loadUserData(): void {
    this.userData = this.authService.getUserData();
    console.log('User data loaded:', this.userData);
    
    // Cache user address
    this.userAddress = this.userData?.permanentAddress || null;
    
    // If no user data, try to fetch profiles
    if (!this.userData || !this.userData.phoneNumber) {
      console.log('User data missing or incomplete, fetching profiles...');
      this.authService.getUserProfiles().subscribe({
        next: () => {
          this.userData = this.authService.getUserData();
          console.log('User data refreshed:', this.userData);
          // Update cached address after refresh
          this.userAddress = this.userData?.permanentAddress || null;
        },
        error: (err) => {
          console.error('Error fetching user profiles:', err);
        }
      });
    }
  }

  openEditAddressDialog(): void {
    if (!this.userAddress) {
      return;
    }

    const profileId = this.getDefaultProfileId();
    if (!profileId) {
      this.showSnackbar('Profile information is missing');
      return;
    }

    const dialogRef = this.dialog.open(EditAddressDialogComponent, {
      width: '520px',
      data: {
        addressId: this.userAddress.id,
        profileId,
        addressLine1: this.userAddress.addressLine1 || '',
        addressLine2: this.userAddress.addressLine2 || '',
        addressLine3: this.userAddress.addressLine3 || '',
        postalCode: this.userAddress.postalCode || '',
        islandId: 0,
        addressTypeId: 0,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.authService.updateProfileAddress(result).subscribe({
        next: (response: { isSuccessful: boolean; statusMessage: string }) => {
          if (response.isSuccessful) {
            this.showSnackbar('Address updated successfully');
            this.authService.getUserProfiles().subscribe({
              next: () => this.loadUserData(),
              error: () => this.loadUserData(),
            });
          } else {
            this.showSnackbar(response.statusMessage || 'Failed to update address');
          }
        },
        error: () => {
          this.showSnackbar('Failed to update address');
        },
      });
    });
  }

  private getDefaultProfileId(): string | null {
    const profiles = this.userData?.userProfiles || [];
    const defaultProfile = profiles.find((profile: any) => profile.isDefault) || profiles[0];
    return defaultProfile?.id || null;
  }

  private showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
  
  get userFullName(): string {
    if (!this.userData) return 'Guest User';
    return this.userData.name || `${this.userData.firstName || ''} ${this.userData.middleName || ''} ${this.userData.lastName || ''}`.trim();
  }
  
  get userEmail(): string {
    return this.userData?.email || 'Not available';
  }
  
  get userPhone(): string {
    // Try phoneNumber first, then fall back to mobileNo
    return this.userData?.phoneNumber || this.userData?.mobileNo || 'Not available';
  }
  
  get userIdNumber(): string {
    return this.userData?.idNumber || 'Not available';
  }
  
  get userNationality(): string {
    return this.userData?.nationality || 'Not available';
  }
  
  get userGender(): string {
    return this.userData?.gender || 'Not specified';
  }
  
  openFilePicker() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click(); // Triggers the file picker
    }
  }

  // Handling file selection
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      console.log('Selected file:', files[0]);
      // Handle file (e.g., upload or display preview)
    }
  }

  groupedTopcards: any[] = [];
  groupImages() {
    const chunkSize = 3;
    for (let i = 0; i < this.topcards.length; i += chunkSize) {
      this.groupedTopcards.push(this.topcards.slice(i, i + chunkSize));
    }
  }
  trackByPost(index: number, post: any): string {
    return post.id; // or any unique identifier from your post object
  }

  hasFeaturedImages(post: Post): boolean {
    return post.data.images.some(
      (img) => 'featured' in img && img.featured === true
    );
  }

  getFeaturedImages(post: Post): { img: string }[] {
    return post.data.images.filter(
      (img) => 'featured' in img && img.featured === true
    );
  }

  hasOtherImages(post: Post): boolean {
    return post.data.images.some((img) => !('featured' in img));
  }

  getOtherImages(post: Post): { img: string }[] {
    return post.data.images.filter((img) => !('featured' in img));
  }
  getSafeVideoUrl(videoUrl: string): SafeResourceUrl {
    const videoId = videoUrl.split('?')[0]; // Just in case there's any query parameters
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/' + videoId
    );
  }
}

@Component({
  selector: 'app-edit-address-dialog',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Update Address</h2>
    <mat-dialog-content class="p-24">
      <form [formGroup]="form">
        <div class="row g-3">
          <div class="col-12">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Address Line 1</mat-label>
              <input matInput formControlName="addressLine1" required />
            </mat-form-field>
          </div>
          <div class="col-12">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Address Line 2</mat-label>
              <input matInput formControlName="addressLine2" />
            </mat-form-field>
          </div>
          <div class="col-12">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Address Line 3</mat-label>
              <input matInput formControlName="addressLine3" />
            </mat-form-field>
          </div>
          <div class="col-12 col-md-4">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Postal Code</mat-label>
              <input matInput formControlName="postalCode" />
            </mat-form-field>
          </div>
          <div class="col-12 col-md-4">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Island ID</mat-label>
              <input matInput type="number" formControlName="islandId" required />
            </mat-form-field>
          </div>
          <div class="col-12 col-md-4">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Address Type ID</mat-label>
              <input matInput type="number" formControlName="addressTypeId" required />
            </mat-form-field>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="p-16 d-flex gap-8">
      <button mat-stroked-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" (click)="onSave()" [disabled]="form.invalid">
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class EditAddressDialogComponent {
  form = this.fb.group({
    addressId: [this.data.addressId, Validators.required],
    profileId: [this.data.profileId, Validators.required],
    addressLine1: [this.data.addressLine1 || '', Validators.required],
    addressLine2: [this.data.addressLine2 || ''],
    addressLine3: [this.data.addressLine3 || ''],
    postalCode: [this.data.postalCode || ''],
    islandId: [this.data.islandId ?? 0, Validators.required],
    addressTypeId: [this.data.addressTypeId ?? 0, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditAddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.value);
  }
}
