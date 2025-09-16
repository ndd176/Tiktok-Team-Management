import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AdminUsersComponent } from './admin/admin-users.component';
import { AdminShopsComponent } from './admin/admin-shops.component';
import { AdminChannelsComponent } from './admin/admin-channels.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'users',
        component: AdminUsersComponent
      },
      {
        path: 'shops',
        component: AdminShopsComponent
      },
      {
        path: 'channels',
        component: AdminChannelsComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/admin/dashboard'
  }
];
