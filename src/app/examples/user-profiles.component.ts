import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { AuthService, UserProfile } from 'src/app/services/auth.service';

/**
 * Example component showing how to fetch and display user profiles
 */
@Component({
  selector: 'app-user-profiles',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>User Profiles</mat-card-title>
        <button mat-icon-button (click)="refreshProfiles()" [disabled]="loading">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-card-header>
      
      <mat-card-content>
        <div *ngIf="loading" class="text-center">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading profiles...</p>
        </div>

        <div *ngIf="!loading && profiles.length > 0">
          <div *ngFor="let profile of profiles" class="profile-card mb-3">
            <div class="d-flex align-items-center gap-2 mb-2">
              <mat-chip-set>
                <mat-chip *ngIf="profile.isDefault" color="primary">Default</mat-chip>
                <mat-chip *ngIf="profile.isVerified" color="accent">Verified</mat-chip>
                <mat-chip>{{ profile.profileType }}</mat-chip>
              </mat-chip-set>
            </div>

            <div *ngIf="profile.profileType === 'Individual'">
              <h3>{{ profile.firstName }} {{ profile.middleName }} {{ profile.lastName }}</h3>
              <p><strong>ID:</strong> {{ profile.identityNumber }}</p>
              <p><strong>Gender:</strong> {{ profile.gender }}</p>
              <p><strong>Nationality:</strong> {{ profile.nationality }}</p>
              <p><strong>Email:</strong> {{ profile.email }}</p>
              <p><strong>Mobile:</strong> {{ profile.mobileNo }}</p>
            </div>

            <div *ngIf="profile.profileType === 'Entity'">
              <h3>{{ profile.entityName }}</h3>
              <p><strong>Registration:</strong> {{ profile.registrationNumber }}</p>
              <p><strong>Type:</strong> {{ profile.entityType }}</p>
              <p><strong>Email:</strong> {{ profile.email }}</p>
              <p><strong>Mobile:</strong> {{ profile.mobileNo }}</p>
            </div>

            <mat-divider class="my-3"></mat-divider>
          </div>
        </div>

        <div *ngIf="!loading && profiles.length === 0">
          <p class="text-muted">No profiles found</p>
        </div>

        <div *ngIf="error" class="alert alert-error">
          <mat-icon>error</mat-icon>
          {{ error }}
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .profile-card {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .alert-error {
      color: #f44336;
      padding: 12px;
      border-radius: 4px;
      background: #ffebee;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class UserProfilesComponent implements OnInit {
  private authService = inject(AuthService);

  profiles: UserProfile[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.loading = true;
    this.error = null;

    this.authService.getUserProfiles().subscribe({
      next: (profiles) => {
        this.profiles = profiles;
        this.loading = false;
        console.log('User profiles loaded:', profiles);
      },
      error: (err) => {
        this.error = 'Failed to load profiles. Please try again.';
        this.loading = false;
        console.error('Error loading profiles:', err);
      }
    });
  }

  refreshProfiles(): void {
    this.loadProfiles();
  }
}
