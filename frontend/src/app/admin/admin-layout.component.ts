import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="admin-layout">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-content">
          <div class="logo">
            <h1>🚀 TikTok Team Admin</h1>
          </div>
          <div class="header-actions">
            <button class="btn-icon">🔔</button>
            <button class="btn-icon">👤</button>
          </div>
        </div>
      </header>

      <!-- Main Container -->
      <div class="admin-container">
        <!-- Sidebar -->
        <aside class="admin-sidebar">
          <nav class="sidebar-nav">
            <a routerLink="/admin/dashboard" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">📊</span>
              <span class="nav-text">Dashboard</span>
            </a>
            <a routerLink="/admin/users" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">👥</span>
              <span class="nav-text">Users</span>
            </a>
            <a routerLink="/admin/shops" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">🏪</span>
              <span class="nav-text">Shops</span>
            </a>
            <a routerLink="/admin/channels" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">📺</span>
              <span class="nav-text">Channels</span>
            </a>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="admin-main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      min-height: 100vh;
      background: #f8fafc;
    }

    .admin-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .logo h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-icon:hover {
      background: rgba(255,255,255,0.3);
      transform: scale(1.05);
    }

    .admin-container {
      display: flex;
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 80px);
    }

    .admin-sidebar {
      width: 250px;
      background: white;
      box-shadow: 2px 0 10px rgba(0,0,0,0.05);
      padding: 2rem 0;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0 1rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: #64748b;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .nav-item:hover {
      background: #f1f5f9;
      color: #1e293b;
      transform: translateX(4px);
    }

    .nav-item.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .nav-icon {
      font-size: 1.2rem;
      width: 24px;
      text-align: center;
    }

    .nav-text {
      font-size: 0.95rem;
    }

    .admin-main {
      flex: 1;
      padding: 2rem;
      overflow-x: hidden;
    }

    @media (max-width: 768px) {
      .admin-container {
        flex-direction: column;
      }
      
      .admin-sidebar {
        width: 100%;
        padding: 1rem 0;
      }
      
      .sidebar-nav {
        flex-direction: row;
        overflow-x: auto;
        padding: 0 1rem;
      }
      
      .nav-item {
        min-width: 120px;
        justify-content: center;
      }
      
      .admin-main {
        padding: 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent {}