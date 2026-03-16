import {
  Component,
  Output,
  EventEmitter,
  Input,
  signal,
  ViewEncapsulation,
  OnInit,
  inject,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { navItems } from '../sidebar/sidebar-data';
import { TranslateService } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { AuthService, UserProfile } from 'src/app/services/auth.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AppSettings } from 'src/app/config';
import { MatDividerModule } from '@angular/material/divider';

interface notifications {
  id: number;
  icon: string;
  color: string;
  title: string;
  time: string;
  subtitle: string;
}

interface profiledd {
  id: number;
  title: string;
  link: string;
  new?: boolean;
}

interface apps {
  id: number;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  link: string;
}

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    CommonModule,
],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;

  isCollapse: boolean = false; // Initially hidden

  // User data
  user: any = null;
  userInitials: string = '';

  toggleCollpase() {
    this.isCollapse = !this.isCollapse; // Toggle visibility
  }


  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: '/assets/images/flag/icon-flag-en.svg',
  };

  public languages: any[] = [
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: '/assets/images/flag/icon-flag-en.svg',
    },
    {
      language: 'Español',
      code: 'es',
      icon: '/assets/images/flag/icon-flag-es.svg',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: '/assets/images/flag/icon-flag-fr.svg',
    },
    {
      language: 'German',
      code: 'de',
      icon: '/assets/images/flag/icon-flag-de.svg',
    },
  ];

  @Output() optionsChange = new EventEmitter<AppSettings>();

  constructor(
    private settings: CoreService,
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private authService: AuthService
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  /**
   * Load user data from AuthService
   */
  loadUserData(): void {
    this.user = this.authService.getUserData();
    
    if (this.user) {
      // Generate user initials
      const firstName = this.user.firstName || '';
      const lastName = this.user.lastName || '';
      this.userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    if (!this.user) return 'Guest User';
    return this.user.name || `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }

  /**
   * Get user email
   */
  getUserEmail(): string {
    return this.user?.email || 'No email available';
  }

  /**
   * Handle logout
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Handle profile menu click
   */
  onProfileMenuClick(profile: profiledd): void {
    if (profile.title === 'Sign Out') {
      this.logout();
    } else if (profile.title === 'Switch Profile') {
      this.openSwitchProfileDialog();
    }
  }

  /**
   * Open switch profile dialog
   */
  openSwitchProfileDialog(): void {
    const dialogRef = this.dialog.open(SwitchProfileDialogComponent, {
      width: '450px',
      data: {
        currentProfile: this.user
      }
    });

    dialogRef.afterClosed().subscribe(selectedProfile => {
      if (selectedProfile) {
        this.switchToProfile(selectedProfile);
      }
    });
  }

  /**
   * Switch to a different profile
   */
  switchToProfile(profile: any): void {
    // Update user data with the selected profile
    this.authService.switchActiveProfile(profile);
    
    // Reload user data
    this.loadUserData();
    
    // Show success message
    const fullName = profile.profileType === 'Individual' 
      ? `${profile.firstName} ${profile.lastName}` 
      : profile.entityName;
    
    console.log(`Switched to profile: ${fullName}`);
    
    // Optionally reload the page to reflect changes
    window.location.reload();
  }

  options = this.settings.getOptions();

  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  setlightDark(theme: string) {
    this.options.theme = theme;
    this.emitOptions();
  }

  private emitOptions() {
    this.optionsChange.emit(this.options);
  }

  notifications: notifications[] = [
    {
      id: 1,
      icon: 'a-b-2',
      color: 'primary',
      time: '8:30 AM',
      title: 'Launch Admin',
      subtitle: 'Just see the my new admin!',
    },
    {
      id: 2,
      icon: 'calendar',
      color: 'secondary',
      time: '8:21 AM',
      title: 'Event today',
      subtitle: 'Just a reminder that you have event',
    },
    {
      id: 3,
      icon: 'settings',
      color: 'warning',
      time: '8:05 AM',
      title: 'Settings',
      subtitle: 'You can customize this template',
    },
    {
      id: 4,
      icon: 'a-b-2',
      color: 'success',
      time: '7:30 AM',
      title: 'Launch Templates',
      subtitle: 'Just see the my new admin!',
    },
    {
      id: 5,
      icon: 'exclamation-circle',
      color: 'error',
      time: '7:03 AM',
      title: 'Event tomorrow',
      subtitle: 'Just a reminder that you have event',
    },
  ];

  profiledd: profiledd[] = [
    {
      id: 1,
      title: 'Switch Profile',
      link: '/',
      
    },
    // {
    //   id: 2,
    //   title: 'Home',
    //   link: '/',
    // },
    // {
    //   id: 3,
    //   title: 'My Invoice',
    //   new: true,
    //   link: '/',
    // },
    {
      id: 4,
      title: ' Account Settings',
      link: '/theme-pages/account-setting',
    },
        {
      id: 5,
      title: ' Profile',
      link: '/apps/profile-details/profile',
    },
    {
      id: 6,
      title: 'Sign Out',
      link: '/authentication/login',
    },
  ];

  apps: apps[] = [
    {
      id: 1,
      icon: 'solar:chat-line-line-duotone',
      color: 'primary',
      title: 'Chat Application',
      subtitle: 'Messages & Emails',
      link: '/',
    },
    {
      id: 2,
      icon: 'solar:checklist-minimalistic-line-duotone',
      color: 'secondary',
      title: 'Todo App',
      subtitle: 'Completed task',
      link: '/',
    },
    {
      id: 3,
      icon: 'solar:bill-list-line-duotone',
      color: 'success',
      title: 'Invoice App',
      subtitle: 'Get latest invoice',
      link: '/',
    },
    {
      id: 4,
      icon: 'solar:calendar-line-duotone',
      color: 'error',
      title: 'Calendar App',
      subtitle: 'Get Dates',
      link: '/',
    },
    {
      id: 5,
      icon: 'solar:smartphone-2-line-duotone',
      color: 'warning',
      title: 'Contact Application',
      subtitle: '2 Unsaved Contacts',
      link: '/',
    },
    {
      id: 6,
      icon: 'solar:ticket-line-duotone',
      color: 'primary',
      title: 'Tickets App',
      subtitle: 'Create new ticket',
      link: '/',
    },
    {
      id: 7,
      icon: 'solar:letter-line-duotone',
      color: 'secondary',
      title: 'Email App',
      subtitle: 'Get new emails',
      link: '/',
    },
    {
      id: 8,
      icon: 'solar:book-2-line-duotone',
      color: 'warning',
      title: 'Contact List',
      subtitle: 'Create new contact',
      link: '/',
    },
  ];
}

@Component({
  selector: 'search-dialog',
  imports: [
    RouterModule,
    MaterialModule,
    TablerIconsModule,
    FormsModule,
    MatDividerModule,
  ],
  templateUrl: 'search-dialog.component.html',
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;

  navItemsData = navItems.filter((navitem) => navitem.displayName);

  // filtered = this.navItemsData.find((obj) => {
  //   return obj.displayName == this.searchinput;
  // });
}

@Component({
  selector: 'app-switch-profile-dialog',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
  ],
  template: `
    <h2 mat-dialog-title>Switch Profile</h2>
    <mat-dialog-content class="p-24">
      @if (isLoading) {
        <div class="d-flex justify-content-center align-items-center p-y-32">
          <mat-spinner diameter="40"></mat-spinner>
          <span class="m-l-16">Loading profiles...</span>
        </div>
      } @else {
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Select Profile</mat-label>
          <mat-select [(value)]="selectedProfile">
            @for(profile of profiles; track profile.id) {
              <mat-option [value]="profile">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    @if(profile.profileType === 'Individual') {
                      <span class="f-w-600">{{ profile.firstName }} {{ profile.lastName }}</span>
                    } @else {
                      <span class="f-w-600">{{ profile.entityName }}</span>
                    }
                    @if(profile.isDefault) {
                      <span class="badge bg-success-subtle text-success f-s-11 m-l-8">Current</span>
                    }
                  </div>
                </div>
                <div class="f-s-12 text-muted m-t-4">
                  {{ profile.email }}
                </div>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- @if(selectedProfile) {
          <mat-card class="cardWithShadow m-t-16">
            <mat-card-content>
              <h6 class="f-s-14 f-w-600 m-b-12">Profile Details</h6>
              <div class="d-flex flex-column gap-8">
                <div class="d-flex align-items-center gap-8">
                  <i-tabler name="user" class="icon-18 text-muted"></i-tabler>
                  <span class="f-s-13">
                    @if(selectedProfile.profileType === 'Individual') {
                      {{ selectedProfile.firstName }} {{ selectedProfile.lastName }}
                    } @else {
                      {{ selectedProfile.entityName }}
                    }
                  </span>
                </div>
                <div class="d-flex align-items-center gap-8">
                  <i-tabler name="mail" class="icon-18 text-muted"></i-tabler>
                  <span class="f-s-13">{{ selectedProfile.email }}</span>
                </div>
                @if(selectedProfile.mobileNo) {
                  <div class="d-flex align-items-center gap-8">
                    <i-tabler name="phone" class="icon-18 text-muted"></i-tabler>
                    <span class="f-s-13">{{ selectedProfile.mobileNo }}</span>
                  </div>
                }
                @if(selectedProfile.profileType === 'Individual' && selectedProfile.identityNumber) {
                  <div class="d-flex align-items-center gap-8">
                    <i-tabler name="id" class="icon-18 text-muted"></i-tabler>
                    <span class="f-s-13">{{ selectedProfile.identityNumber }}</span>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        } -->
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="p-16 d-flex gap-8">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" (click)="onSwitch()" 
              [disabled]="!selectedProfile || selectedProfile.isDefault || isLoading">
        Switch Profile
      </button>
    </mat-dialog-actions>
  `,
})
export class SwitchProfileDialogComponent implements OnInit {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  profiles: UserProfile[] = [];
  selectedProfile: UserProfile | null = null;
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<SwitchProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.isLoading = true;
    this.authService.getUserProfiles().subscribe({
      next: (profiles: UserProfile[]) => {
        this.profiles = profiles;
        this.isLoading = false;
        
        // Pre-select the current default profile
        this.selectedProfile = profiles.find(p => p.isDefault) || null;
      },
      error: (error) => {
        console.error('Error loading profiles:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to load profiles', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSwitch(): void {
    if (this.selectedProfile) {
      this.dialogRef.close(this.selectedProfile);
    }
  }
}
