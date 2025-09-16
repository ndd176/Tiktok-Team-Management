import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AdminUsersComponent } from './admin/admin-users.component';
import { AdminShopsComponent } from './admin/admin-shops.component';
import { AdminChannelsComponent } from './admin/admin-channels.component';
import { FloatButtonComponent } from './float-button/float-button.component';
import { SupportTaskFormComponent } from './task-forms/support-task-form.component';
import { MediaTaskFormComponent } from './task-forms/media-task-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterModule, 
    CommonModule,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminShopsComponent,
    AdminChannelsComponent,
    FloatButtonComponent,
    SupportTaskFormComponent,
    MediaTaskFormComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'TikTok Team Admin Dashboard';
  showTest = true;
  activeSection = 'dashboard';
  backendStatus = { text: 'Checking...', class: 'status-checking' };
  usersCount = 0;
  shopsCount = 0;
  channelsCount = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.testConnection();
  }

  async testConnection() {
    try {
      // Test backend connection
      const testResponse = await this.http.get('http://localhost:4000/api/test').toPromise();
      this.backendStatus = { text: '✅ Connected', class: 'status-success' };

      // Get data counts
      const users = await this.http.get<any[]>('http://localhost:4000/api/users').toPromise();
      const shops = await this.http.get<any[]>('http://localhost:4000/api/shops').toPromise();
      const channels = await this.http.get<any[]>('http://localhost:4000/api/channels').toPromise();

      this.usersCount = users?.length || 0;
      this.shopsCount = shops?.length || 0;
      this.channelsCount = channels?.length || 0;

    } catch (error) {
      console.error('Connection test failed:', error);
      this.backendStatus = { text: '❌ Failed', class: 'status-error' };
    }
  }

  hideTest() {
    this.showTest = false;
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }
}
