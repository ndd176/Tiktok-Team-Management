import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AdminUsersComponent } from './admin/admin-users.component';
import { AdminShopsComponent } from './admin/admin-shops.component';
import { AdminChannelsComponent } from './admin/admin-channels.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { ShopDetailComponent } from './shops/shop-detail/shop-detail.component';
import { ChannelDetailComponent } from './channels/channel-detail/channel-detail.component';
import { MediaDashboardComponent } from './media/media-dashboard.component';

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
        path: 'users/:id',
        component: UserDetailComponent
      },
      {
        path: 'shops',
        component: AdminShopsComponent
      },
      {
        path: 'shops/:id',
        component: ShopDetailComponent
      },
      {
        path: 'channels',
        component: AdminChannelsComponent
      },
      {
        path: 'channels/:id',
        component: ChannelDetailComponent
      }
    ]
  },
  {
    path: 'media',
    component: MediaDashboardComponent
  },
  {
    path: '**',
    redirectTo: '/admin/dashboard'
  }
];
