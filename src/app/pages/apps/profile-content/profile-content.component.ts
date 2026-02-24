import { Component,inject } from '@angular/core';

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
export class ProfileContentComponent {
  pageTitle = 'UserProfile';
  selectedTab = 0;
  userData: any = null;
  private authService = inject(AuthService);

  ngOnInit(): void {
      this.loadUserData();
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

