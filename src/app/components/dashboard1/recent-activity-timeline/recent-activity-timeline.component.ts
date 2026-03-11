import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { RouterModule } from '@angular/router';

interface Activity {
  time: string;
  color: string;
  subtext?: string;
  title?: string;
  link?: string;
}

@Component({
  selector: 'app-recent-activity-timeline',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, RouterModule],
  templateUrl: './recent-activity-timeline.component.html',
  styleUrls: ['./recent-activity-timeline.component.scss']
})
export class RecentActivityTimelineComponent {
  
  activities: Activity[] = [
    {
      time: '09:30 am',
      color: 'success',
      title: 'New Water Connection',
      subtext: 'Application approved',
      link: 'APP-2024-001',
    },
    {
      time: '10:00 am',
      color: 'info',
      title: 'Meter Replacement',
      subtext: 'Documents verified',
      link: 'APP-2024-002',
    },
    {
      time: '12:15 pm',
      color: 'warning',
      title: 'Service Reconnection',
      subtext: 'Under review',
      link: 'APP-2024-003',
    },
    {
      time: '01:10 pm',
      color: 'error',
      title: 'Bill Dispute',
      subtext: 'Document required',
      link: 'APP-2024-004',
    },
    {
      time: '02:30 pm',
      color: 'primary',
      title: 'Address Change',
      subtext: 'Submitted successfully',
      link: 'APP-2024-005',
    },
  ];
}
