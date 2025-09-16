import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-detail-page">
      <div class="header-section">
        <button class="btn-back" (click)="goBack()">
          ← Back to Dashboard
        </button>
        
        <div class="user-header" *ngIf="user">
          <div class="user-avatar-large">
            {{user.name.charAt(0).toUpperCase()}}
          </div>
          <div class="user-info">
            <h1>{{user.name}}</h1>
            <p class="user-email">{{user.email}}</p>
            <span class="user-id-badge">ID: {{user.id}}</span>
          </div>
        </div>
      </div>

      <div class="performance-section">
        <div class="section-header">
          <h2>📊 Performance Overview</h2>
          <div class="date-filter">
            <select [(ngModel)]="selectedPeriod" (change)="loadPerformanceData()">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>

        <!-- Performance Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
              <h3>Total Tasks</h3>
              <div class="stat-value">{{performanceData.totalTasks}}</div>
              <div class="stat-change positive">+12% vs last period</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>Completed</h3>
              <div class="stat-value">{{performanceData.completedTasks}}</div>
              <div class="stat-change positive">+8% vs last period</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <h3>Success Rate</h3>
              <div class="stat-value">{{performanceData.successRate}}%</div>
              <div class="stat-change positive">+5% vs last period</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <h3>Quality Score</h3>
              <div class="stat-value">{{performanceData.qualityScore}}/10</div>
              <div class="stat-change neutral">Same as last period</div>
            </div>
          </div>
        </div>

        <!-- Performance Table -->
        <div class="performance-table-section">
          <h3>📈 Detailed Performance</h3>
          <div class="table-container">
            <table class="performance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Task Type</th>
                  <th>Shop/Channel</th>
                  <th>Status</th>
                  <th>Quality</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let task of performanceTasks" class="task-row">
                  <td>{{task.date | date:'MMM dd'}}</td>
                  <td>
                    <span class="task-type" [class]="task.type">
                      {{task.type | titlecase}}
                    </span>
                  </td>
                  <td>{{task.target}}</td>
                  <td>
                    <span class="status-badge" [class]="task.status">
                      {{task.status | titlecase}}
                    </span>
                  </td>
                  <td>
                    <div class="quality-rating">
                      <span class="stars">
                        <span *ngFor="let star of getStars(task.quality)" 
                              class="star" [class.filled]="star">⭐</span>
                      </span>
                      <span class="rating-text">{{task.quality}}/5</span>
                    </div>
                  </td>
                  <td class="notes-cell">{{task.notes}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading performance data...</p>
      </div>
    </div>
  `,
  styles: [`
    .user-detail-page {
      min-height: 100vh;
      background: #f8fafc;
      padding: 2rem;
    }

    .header-section {
      margin-bottom: 2rem;
    }

    .btn-back {
      background: #6b7280;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;
      font-weight: 600;
    }

    .btn-back:hover {
      background: #4b5563;
      transform: translateY(-2px);
    }

    .user-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .user-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 2rem;
    }

    .user-info h1 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
      font-size: 2rem;
    }

    .user-email {
      margin: 0 0 0.5rem 0;
      color: #64748b;
      font-size: 1.1rem;
    }

    .user-id-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .performance-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-header h2 {
      margin: 0;
      color: #1e293b;
      font-size: 1.5rem;
    }

    .date-filter select {
      padding: 0.5rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      font-size: 1rem;
      cursor: pointer;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .stat-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-content h3 {
      margin: 0 0 0.5rem 0;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .stat-change {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .stat-change.positive { color: #059669; }
    .stat-change.negative { color: #dc2626; }
    .stat-change.neutral { color: #64748b; }

    .performance-table-section {
      margin-top: 2rem;
    }

    .performance-table-section h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1.25rem;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .performance-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .performance-table th {
      background: #f8fafc;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    .performance-table td {
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .task-row:hover {
      background: #f8fafc;
    }

    .task-type {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .task-type.support {
      background: #dbeafe;
      color: #1e40af;
    }

    .task-type.media {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge.completed {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge.in-progress {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.pending {
      background: #e0e7ff;
      color: #3730a3;
    }

    .quality-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .star {
      opacity: 0.3;
    }

    .star.filled {
      opacity: 1;
    }

    .rating-text {
      font-size: 0.75rem;
      color: #64748b;
    }

    .notes-cell {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #64748b;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .user-detail-page {
        padding: 1rem;
      }

      .user-header {
        flex-direction: column;
        text-align: center;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .table-container {
        font-size: 0.75rem;
      }

      .performance-table th,
      .performance-table td {
        padding: 0.5rem;
      }
    }
  `]
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = false;
  selectedPeriod = 'month';
  
  performanceData = {
    totalTasks: 45,
    completedTasks: 38,
    successRate: 84.4,
    qualityScore: 8.5
  };

  performanceTasks = [
    {
      date: new Date('2025-09-15'),
      type: 'support',
      target: 'Shop Alpha',
      status: 'completed',
      quality: 5,
      notes: 'Excellent listing optimization'
    },
    {
      date: new Date('2025-09-14'),
      type: 'media',
      target: 'Channel Beta',
      status: 'completed',
      quality: 4,
      notes: 'Good video content creation'
    },
    {
      date: new Date('2025-09-13'),
      type: 'support',
      target: 'Shop Gamma',
      status: 'in-progress',
      quality: 3,
      notes: 'Working on product listings'
    },
    {
      date: new Date('2025-09-12'),
      type: 'media',
      target: 'Channel Delta',
      status: 'completed',
      quality: 5,
      notes: 'High-quality promotional videos'
    },
    {
      date: new Date('2025-09-11'),
      type: 'support',
      target: 'Shop Epsilon',
      status: 'pending',
      quality: 0,
      notes: 'Awaiting client approval'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    const userId = this.route.snapshot.params['id'];
    this.loadUserData(userId);
  }

  loadUserData(userId: number) {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.user = users.find(u => u.id == userId) || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.loading = false;
      }
    });
  }

  loadPerformanceData() {
    // Simulate API call to load performance data based on selected period
    console.log('Loading performance data for period:', this.selectedPeriod);
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}