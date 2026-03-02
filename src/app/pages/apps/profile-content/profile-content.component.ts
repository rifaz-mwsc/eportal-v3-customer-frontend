import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProfileComponent } from './profile/profile.component';
import { FollowersComponent } from './followers/followers.component';
import { FriendsComponent } from './friends/friends.component';
import { GalleryComponent } from './gallery/gallery.component';
import { MaterialModule } from 'src/app/material.module';

import { AuthService } from 'src/app/services/auth.service';

import { IconModule } from 'src/app/icon/icon.module';
@Component({
  selector: 'app-profile-content',
  imports: [MaterialModule, ProfileComponent, FollowersComponent, FriendsComponent, GalleryComponent, IconModule],
  templateUrl: './profile-content.component.html',
  styleUrl: './profile-content.component.scss'
})
export class ProfileContentComponent implements OnInit {
  pageTitle = 'UserProfile';
  selectedTab = 0;
  userData: any = null;
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.warn('User not authenticated, redirecting to login');
      this.authService.clearAuthData();
      this.router.navigate(['/authentication/login']);
      return;
    }

    this.loadUserData();

    // If user data is not available, clear auth and redirect
    if (!this.userData || !this.userData.name) {
      console.warn('User data not available, redirecting to login');
      this.authService.clearAuthData();
      this.router.navigate(['/authentication/login']);
    }
  }
    
  loadUserData(): void {
    this.userData = this.authService.getUserData();
    console.log('User data loaded-ProfileContentComponent:', this.userData);
  }

  get userFullName(): string {
    if (!this.userData) return 'Guest User';
    return this.userData.name || `${this.userData.firstName || ''} ${this.userData.middleName || ''} ${this.userData.lastName || ''}`.trim();
  }
  
}

