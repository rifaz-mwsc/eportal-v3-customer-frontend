import { Component } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NoLinkedBusinessComponent } from 'src/app/components/dashboard1/no-linked-business/no-linked-business.component';
import { ApplicationStatusOverviewComponent } from 'src/app/components/dashboard1/application-status-overview/application-status-overview.component';
import { ProcessingTimelineComponent } from 'src/app/components/dashboard1/processing-timeline/processing-timeline.component';
import { RecentActivityTimelineComponent } from 'src/app/components/dashboard1/recent-activity-timeline/recent-activity-timeline.component';

@Component({
  selector: 'app-dashboard1',
  standalone: true,
  imports: [
    TablerIconsModule,
    NoLinkedBusinessComponent,
    ApplicationStatusOverviewComponent,
    ProcessingTimelineComponent,
    RecentActivityTimelineComponent,
  ],
  templateUrl: './dashboard1.component.html',
})
export class AppDashboard1Component {
  constructor() {}
}
