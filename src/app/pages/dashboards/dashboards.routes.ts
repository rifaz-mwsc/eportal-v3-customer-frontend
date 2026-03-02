import { Routes } from '@angular/router';
import { authGuard } from 'src/app/guards/auth.guard';

// dashboards
import { AppDashboard1Component } from './dashboard1/dashboard1.component';
import { AppDashboard2Component } from './dashboard2/dashboard2.component';
import { AppDashboard3Component } from './dashboard3/dashboard3.component';

export const DashboardsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard1',
        component: AppDashboard1Component,
        canActivate: [authGuard],
        data: {
          title: 'Dashboard 1',
        
          breadcrumb: false,
        },
      },
      {
        path: 'dashboard2',
        component: AppDashboard2Component,
        canActivate: [authGuard],
        data: {
          title: 'Dashboard 2',
          breadcrumb: false,
        },
      },
      {
        path: 'dashboard3',
        component: AppDashboard3Component,
        canActivate: [authGuard],
        data: {
          title: 'Dashboard 3',
          breadcrumb: false,
        },
      },
    ],
  },
];
