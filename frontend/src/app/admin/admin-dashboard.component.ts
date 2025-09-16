import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to TikTok Team Management System</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card users">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{userCount}}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div class="stat-card shops">
          <div class="stat-icon">🏪</div>
          <div class="stat-content">
            <h3>{{shopCount}}</h3>
            <p>Total Shops</p>
          </div>
        </div>

        <div class="stat-card channels">
          <div class="stat-icon">📺</div>
          <div class="stat-content">
            <h3>{{channelCount}}</h3>
            <p>Total Channels</p>
          </div>
        </div>

        <div class="stat-card total">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{userCount + shopCount + channelCount}}</h3>
            <p>Total Items</p>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="dashboard-card">
          <h2>🚀 Quick Actions</h2>
          <div class="quick-actions">
            <button class="action-btn users" routerLink="/admin/users">
              <span>👥</span>
              Manage Users
            </button>
            <button class="action-btn shops" routerLink="/admin/shops">
              <span>🏪</span>
              Manage Shops
            </button>
            <button class="action-btn channels" routerLink="/admin/channels">
              <span>📺</span>
              Manage Channels
            </button>
          </div>
        </div>

        <div class="dashboard-card">
          <h2>📈 Recent Activity</h2>
          <div class="activity-list">
            <div class="activity-item">
              <span class="activity-icon">👥</span>
              <span class="activity-text">User management system ready</span>
              <span class="activity-time">Now</span>
            </div>
            <div class="activity-item">
              <span class="activity-icon">🏪</span>
              <span class="activity-text">Shop management system ready</span>
              <span class="activity-time">Now</span>
            </div>
            <div class="activity-item">
              <span class="activity-icon">📺</span>
              <span class="activity-text">Channel management system ready</span>
              <span class="activity-time">Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .dashboard-header p {
      color: #64748b;
      font-size: 1.1rem;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
      border-left: 4px solid;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .stat-card.users { border-left-color: #3b82f6; }
    .stat-card.shops { border-left-color: #10b981; }
    .stat-card.channels { border-left-color: #f59e0b; }
    .stat-card.total { border-left-color: #8b5cf6; }

    .stat-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      color: #1e293b;
    }

    .stat-content p {
      color: #64748b;
      margin: 0;
      font-weight: 500;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .dashboard-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .dashboard-card h2 {
      margin: 0 0 1.5rem 0;
      color: #1e293b;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      background: #f8fafc;
      color: #1e293b;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .action-btn:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .action-btn.users:hover { background: #dbeafe; }
    .action-btn.shops:hover { background: #d1fae5; }
    .action-btn.channels:hover { background: #fef3c7; }

    .action-btn span {
      font-size: 1.2rem;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .activity-icon {
      font-size: 1.2rem;
    }

    .activity-text {
      flex: 1;
      color: #1e293b;
      font-weight: 500;
    }

    .activity-time {
      color: #64748b;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .dashboard-header h1 {
        font-size: 2rem;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent {
  userCount = 0;
  shopCount = 0;
  channelCount = 0;

  constructor() {
    // Simulate loading stats - you can replace with actual API calls
    this.loadStats();
  }

  private loadStats() {
    // Mock data - replace with actual service calls
    setTimeout(() => {
      this.userCount = 15;
      this.shopCount = 8;
      this.channelCount = 12;
    }, 500);
  }
}