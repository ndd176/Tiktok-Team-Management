import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ShopService } from '../services/shop.service';
import { ChannelService } from '../services/channel.service';
import { TaskService, Task as TaskInterface } from '../services/task.service';
import { forkJoin, Subscription } from 'rxjs';

interface Task extends TaskInterface {}

interface PerformanceData {
  userId: number;
  userName: string;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  totalTasks: number;
  completionRate: number;
  avgQuality: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <!-- Header Section -->
      <div class="dashboard-header">
        <h1>📊 Dashboard Overview</h1>
        <p class="subtitle">Today's Performance & Task Management</p>
        <div class="date-info">
          <span class="current-date">{{currentDate | date:'fullDate'}}</span>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-overview">
        <div class="stat-card users" (click)="navigateToUsers()">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{users.length}}</h3>
            <p>Active Users</p>
            <div class="stat-change positive">+5% this week</div>
          </div>
        </div>

        <div class="stat-card shops" (click)="navigateToShops()">
          <div class="stat-icon">🏪</div>
          <div class="stat-content">
            <h3>{{shops.length}}</h3>
            <p>Total Shops</p>
            <div class="stat-change positive">+12% this month</div>
          </div>
        </div>

        <div class="stat-card channels" (click)="navigateToChannels()">
          <div class="stat-icon">📺</div>
          <div class="stat-content">
            <h3>{{channels.length}}</h3>
            <p>Active Channels</p>
            <div class="stat-change neutral">Same as last week</div>
          </div>
        </div>

        <div class="stat-card tasks">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3>{{todayTasks.length}}</h3>
            <p>Today's Tasks</p>
            <div class="stat-change positive">{{completedTasks}}/{{todayTasks.length}} completed</div>
          </div>
        </div>

        <div class="stat-card media" (click)="navigateToMediaDashboard()">
          <div class="stat-icon">🎥</div>
          <div class="stat-content">
            <h3>Media</h3>
            <p>Video Dashboard</p>
            <div class="stat-change info">Switch to Media View</div>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Performance Chart -->
        <div class="performance-section">
          <div class="section-header">
            <h2>🎯 Today's Performance</h2>
            <div class="view-toggle">
              <button class="toggle-btn" [class.active]="viewMode === 'chart'" (click)="viewMode = 'chart'">Chart</button>
              <button class="toggle-btn" [class.active]="viewMode === 'table'" (click)="viewMode = 'table'">Table</button>
            </div>
          </div>

          <!-- Performance Chart View -->
          <div class="performance-chart" *ngIf="viewMode === 'chart'">
            <div class="chart-container">
              <div class="chart-bars">
                <div *ngFor="let perf of performanceData" class="chart-bar-group">
                  <div class="chart-bars-stack">
                    <div class="chart-bar completed" 
                         [style.height.%]="getBarHeight(perf.tasksCompleted, perf.totalTasks)"
                         [title]="'Completed: ' + perf.tasksCompleted">
                    </div>
                    <div class="chart-bar in-progress" 
                         [style.height.%]="getBarHeight(perf.tasksInProgress, perf.totalTasks)"
                         [title]="'In Progress: ' + perf.tasksInProgress">
                    </div>
                    <div class="chart-bar pending" 
                         [style.height.%]="getBarHeight(perf.tasksPending, perf.totalTasks)"
                         [title]="'Pending: ' + perf.tasksPending">
                    </div>
                  </div>
                  <div class="chart-label" (click)="viewUserDetail(perf.userId)">
                    {{perf.userName.split(' ')[0]}}
                    <div class="completion-rate">{{perf.completionRate}}%</div>
                  </div>
                </div>
              </div>
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-color completed"></div>
                  <span>Completed</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color in-progress"></div>
                  <span>In Progress</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color pending"></div>
                  <span>Pending</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Table View -->
          <div class="performance-table" *ngIf="viewMode === 'table'">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Completed</th>
                  <th>In Progress</th>
                  <th>Pending</th>
                  <th>Rate</th>
                  <th>Quality</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let perf of performanceData" class="performance-row">
                  <td class="user-cell" (click)="viewUserDetail(perf.userId)">
                    <div class="user-avatar-small">{{perf.userName.charAt(0)}}</div>
                    <span>{{perf.userName}}</span>
                  </td>
                  <td><span class="count completed">{{perf.tasksCompleted}}</span></td>
                  <td><span class="count in-progress">{{perf.tasksInProgress}}</span></td>
                  <td><span class="count pending">{{perf.tasksPending}}</span></td>
                  <td><span class="rate" [class]="getRateClass(perf.completionRate)">{{perf.completionRate}}%</span></td>
                  <td><span class="quality">{{perf.avgQuality}}/5 ⭐</span></td>
                  <td>
                    <button class="btn-view-detail" (click)="viewUserDetail(perf.userId)">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Today's Tasks -->
        <div class="tasks-section">
          <div class="section-header">
            <h2>📋 Today's Tasks</h2>
            <div class="task-filters">
              <button class="filter-btn" [class.active]="taskFilter === 'all'" (click)="taskFilter = 'all'">
                All ({{todayTasks.length}})
              </button>
              <button class="filter-btn" [class.active]="taskFilter === 'pending'" (click)="taskFilter = 'pending'">
                Pending ({{getPendingTasks().length}})
              </button>
              <button class="filter-btn" [class.active]="taskFilter === 'in-progress'" (click)="taskFilter = 'in-progress'">
                Active ({{getActiveTasks().length}})
              </button>
              <button class="filter-btn" [class.active]="taskFilter === 'completed'" (click)="taskFilter = 'completed'">
                Done ({{getCompletedTasks().length}})
              </button>
            </div>
          </div>

          <div class="tasks-grid">
            <div *ngFor="let task of getFilteredTasks()" class="task-card" [class]="task.status" (click)="viewTaskDetail(task)">
              <div class="task-header">
                <div class="task-type" [class]="task.type">
                  <span class="type-icon">{{task.type === 'support' ? '🛠️' : '🎬'}}</span>
                  <span class="type-text">{{task.type | titlecase}}</span>
                </div>
                <div class="task-priority" [class]="task.priority">
                  {{task.priority | titlecase}}
                </div>
              </div>

              <div class="task-content">
                <h4 class="task-title">{{task.title}}</h4>
                <div class="task-details">
                  <div class="assigned-to" (click)="viewUserDetail(task.assignedTo.id); $event.stopPropagation()">
                    <div class="user-avatar-tiny">{{task.assignedTo.name.charAt(0)}}</div>
                    <span>{{task.assignedTo.name}}</span>
                  </div>
                  <div class="task-target">
                    <span class="target-type">{{task.shop ? '🏪' : '📺'}}</span>
                    <span class="target-name" (click)="navigateToTarget(task); $event.stopPropagation()">
                      {{task.shop?.name || task.channel?.name}}
                    </span>
                  </div>
                </div>

                <div class="task-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="task.progress"></div>
                  </div>
                  <span class="progress-text">{{task.progress}}%</span>
                </div>

                <div class="task-footer">
                  <div class="task-status" [class]="task.status">
                    {{task.status | titlecase}}
                  </div>
                  <div class="task-due">
                    Due: {{task.dueDate | date:'MMM dd'}}
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="getFilteredTasks().length === 0" class="empty-tasks">
              <div class="empty-icon">📝</div>
              <p>No {{taskFilter === 'all' ? '' : taskFilter}} tasks for today</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Overview Cards -->
      <div class="team-overview">
        <h2>👥 Team Overview</h2>
        <div class="team-grid">
          <div *ngFor="let user of users" class="team-card" (click)="viewUserDetail(user.id)">
            <div class="team-avatar">{{user.name.charAt(0)}}</div>
            <div class="team-info">
              <h4>{{user.name}}</h4>
              <p>{{user.email}}</p>
              <div class="team-stats">
                <span class="stat">{{getUserTaskCount(user.id)}} tasks</span>
                <span class="stat">{{getUserCompletionRate(user.id)}}% done</span>
              </div>
            </div>
            <div class="team-status" [class]="getUserStatus(user.id)">
              {{getUserStatus(user.id)}}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      animation: fadeIn 0.5s ease-in;
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header Styles */
    .dashboard-header {
      margin-bottom: 2rem;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0 0 1rem 0;
    }

    .date-info {
      opacity: 0.8;
      font-size: 1rem;
    }

    /* Stats Overview */
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
      cursor: pointer;
      border: 2px solid transparent;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
      border-color: #667eea;
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
      color: #1e293b;
    }

    .stat-content p {
      color: #64748b;
      margin: 0 0 0.5rem 0;
      font-weight: 500;
    }

    .stat-change {
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
    }

    .stat-change.positive {
      background: #dcfce7;
      color: #16a34a;
    }

    .stat-change.neutral {
      background: #f1f5f9;
      color: #64748b;
    }

    .stat-change.info {
      background: #dbeafe;
      color: #2563eb;
    }

    /* Dashboard Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .performance-section, .tasks-section {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    /* Performance Chart */
    .view-toggle {
      display: flex;
      gap: 0.5rem;
    }

    .toggle-btn {
      padding: 0.5rem 1rem;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .toggle-btn.active {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }

    .chart-container {
      height: 300px;
      display: flex;
      flex-direction: column;
    }

    .chart-bars {
      flex: 1;
      display: flex;
      align-items: end;
      gap: 1rem;
      padding: 1rem 0;
    }

    .chart-bar-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .chart-bars-stack {
      height: 200px;
      width: 100%;
      display: flex;
      flex-direction: column-reverse;
      gap: 1px;
      border-radius: 4px;
      overflow: hidden;
      min-height: 20px;
    }

    .chart-bar {
      min-height: 4px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .chart-bar.completed {
      background: linear-gradient(180deg, #10b981, #059669);
    }

    .chart-bar.in-progress {
      background: linear-gradient(180deg, #f59e0b, #d97706);
    }

    .chart-bar.pending {
      background: linear-gradient(180deg, #ef4444, #dc2626);
    }

    .chart-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      text-align: center;
    }

    .chart-label:hover {
      color: #667eea;
    }

    .completion-rate {
      font-size: 0.75rem;
      color: #10b981;
      font-weight: 600;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-color.completed {
      background: #10b981;
    }

    .legend-color.in-progress {
      background: #f59e0b;
    }

    .legend-color.pending {
      background: #ef4444;
    }

    /* Performance Table */
    .performance-table {
      overflow-x: auto;
    }

    .performance-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .performance-table th,
    .performance-table td {
      text-align: left;
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .performance-table th {
      font-weight: 600;
      color: #374151;
      background: #f8fafc;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .user-cell:hover {
      color: #667eea;
    }

    .user-avatar-small {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .count {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .count.completed {
      background: #dcfce7;
      color: #16a34a;
    }

    .count.in-progress {
      background: #fef3c7;
      color: #d97706;
    }

    .count.pending {
      background: #fee2e2;
      color: #dc2626;
    }

    .rate.excellent {
      color: #16a34a;
      font-weight: 600;
    }

    .rate.good {
      color: #10b981;
      font-weight: 600;
    }

    .rate.average {
      color: #f59e0b;
      font-weight: 600;
    }

    .rate.poor {
      color: #ef4444;
      font-weight: 600;
    }

    .btn-view-detail {
      padding: 0.375rem 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.2s;
    }

    .btn-view-detail:hover {
      background: #5b6cf2;
    }

    /* Task Filters */
    .task-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.5rem 0.75rem;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .filter-btn.active {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }

    /* Tasks Grid */
    .tasks-grid {
      display: grid;
      gap: 1rem;
      max-height: 400px;
      overflow-y: auto;
    }

    .task-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
    }

    .task-card:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .task-card.completed {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .task-card.in-progress {
      border-color: #f59e0b;
      background: #fffbeb;
    }

    .task-card.pending {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .task-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .task-type.support {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .task-type.media {
      background: #fde2e7;
      color: #be185d;
    }

    .task-priority {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .task-priority.high {
      background: #fee2e2;
      color: #dc2626;
    }

    .task-priority.medium {
      background: #fef3c7;
      color: #d97706;
    }

    .task-priority.low {
      background: #dcfce7;
      color: #16a34a;
    }

    .task-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #1e293b;
    }

    .task-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      gap: 1rem;
    }

    .assigned-to {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .assigned-to:hover {
      background: #f1f5f9;
    }

    .user-avatar-tiny {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .task-target {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .task-target:hover {
      background: #f1f5f9;
    }

    .target-name {
      font-size: 0.875rem;
      color: #64748b;
    }

    .task-progress {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      min-width: 40px;
    }

    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .task-status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .task-status.completed {
      background: #dcfce7;
      color: #16a34a;
    }

    .task-status.in-progress {
      background: #fef3c7;
      color: #d97706;
    }

    .task-status.pending {
      background: #fee2e2;
      color: #dc2626;
    }

    .task-due {
      font-size: 0.875rem;
      color: #64748b;
    }

    .empty-tasks {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    /* Team Overview */
    .team-overview {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }

    .team-overview h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1.5rem 0;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .team-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .team-card:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .team-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.25rem;
    }

    .team-info {
      flex: 1;
    }

    .team-info h4 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: #1e293b;
    }

    .team-info p {
      color: #64748b;
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
    }

    .team-stats {
      display: flex;
      gap: 1rem;
    }

    .team-stats .stat {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }

    .team-status {
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .team-status.excellent {
      background: #dcfce7;
      color: #16a34a;
    }

    .team-status.active {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .team-status.moderate {
      background: #fef3c7;
      color: #d97706;
    }

    .team-status.needs-attention {
      background: #fee2e2;
      color: #dc2626;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .stats-overview {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: 0.5rem;
      }

      .dashboard-header {
        padding: 1.5rem;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }

      .stats-overview {
        grid-template-columns: 1fr;
      }

      .team-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .task-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentDate = new Date();
  users: any[] = [];
  shops: any[] = [];
  channels: any[] = [];
  todayTasks: Task[] = [];
  performanceData: PerformanceData[] = [];
  viewMode: 'chart' | 'table' = 'chart';
  taskFilter: 'all' | 'pending' | 'in-progress' | 'completed' = 'all';
  completedTasks = 0;
  
  private tasksSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private shopService: ShopService,
    private channelService: ChannelService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
    
    // Subscribe to task changes
    this.tasksSubscription = this.taskService.getTasks().subscribe(tasks => {
      this.todayTasks = tasks;
      this.completedTasks = tasks.filter(task => task.status === 'completed').length;
      this.generatePerformanceData();
    });
    
    // Initialize with mock data if no tasks exist
    setTimeout(() => {
      if (this.todayTasks.length === 0) {
        this.generateMockTasks();
      }
    }, 1000);
  }
  
  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  loadData() {
    forkJoin({
      users: this.userService.getUsers(),
      shops: this.shopService.getShops(),
      channels: this.channelService.getChannels()
    }).subscribe(data => {
      this.users = data.users;
      this.shops = data.shops;
      this.channels = data.channels;
      this.generateMockTasks();
    });
  }

  generateMockTasks() {
    const taskTitles = [
      'Update product listings',
      'Fix shop description',
      'Optimize product images',
      'Create promotional video',
      'Edit product showcase',
      'Update channel banner',
      'Respond to customer messages',
      'Process bulk orders',
      'Analyze performance metrics'
    ];

    const mockTasks: Task[] = [];
    
    for (let i = 0; i < 12; i++) {
      const isShopTask = Math.random() > 0.5;
      const user = this.users[Math.floor(Math.random() * this.users.length)] || { id: 1, name: 'Demo User' };
      const shop = isShopTask ? this.shops[Math.floor(Math.random() * this.shops.length)] : null;
      const channel = !isShopTask ? this.channels[Math.floor(Math.random() * this.channels.length)] : null;
      
      const status = ['pending', 'in-progress', 'completed'][Math.floor(Math.random() * 3)];
      const progress = status === 'completed' ? 100 : 
                     status === 'in-progress' ? Math.floor(Math.random() * 80) + 20 :
                     Math.floor(Math.random() * 20);

      mockTasks.push({
        id: i + 1,
        title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
        description: `Task description for ${taskTitles[Math.floor(Math.random() * taskTitles.length)].toLowerCase()}`,
        type: isShopTask ? 'support' : 'media',
        status: status as Task['status'],
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as Task['priority'],
        assignedTo: {
          id: user.id,
          name: user.name
        },
        shop: shop,
        channel: channel,
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        progress: progress
      });
    }
    
    // Set tasks through service
    this.taskService.setTasks(mockTasks);
  }

  generatePerformanceData() {
    this.performanceData = this.users.map(user => {
      const userTasks = this.todayTasks.filter(task => task.assignedTo.id === user.id);
      const completed = userTasks.filter(task => task.status === 'completed').length;
      const inProgress = userTasks.filter(task => task.status === 'in-progress').length;
      const pending = userTasks.filter(task => task.status === 'pending').length;
      const total = userTasks.length;
      
      return {
        userId: user.id,
        userName: user.name,
        tasksCompleted: completed,
        tasksInProgress: inProgress,
        tasksPending: pending,
        totalTasks: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        avgQuality: Number((Math.random() * 2 + 3).toFixed(1))
      };
    });
  }

  // Chart helpers
  getBarHeight(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  getRateClass(rate: number): string {
    if (rate >= 80) return 'excellent';
    if (rate >= 60) return 'good';
    if (rate >= 40) return 'average';
    return 'poor';
  }

  // Task filtering
  getFilteredTasks(): Task[] {
    if (this.taskFilter === 'all') return this.todayTasks;
    return this.todayTasks.filter(task => task.status === this.taskFilter);
  }

  getPendingTasks(): Task[] {
    return this.todayTasks.filter(task => task.status === 'pending');
  }

  getActiveTasks(): Task[] {
    return this.todayTasks.filter(task => task.status === 'in-progress');
  }

  getCompletedTasks(): Task[] {
    return this.todayTasks.filter(task => task.status === 'completed');
  }

  // Team helpers
  getUserTaskCount(userId: number): number {
    return this.todayTasks.filter(task => task.assignedTo.id === userId).length;
  }

  getUserCompletionRate(userId: number): number {
    const userTasks = this.todayTasks.filter(task => task.assignedTo.id === userId);
    const completed = userTasks.filter(task => task.status === 'completed').length;
    return userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0;
  }

  getUserStatus(userId: number): string {
    const rate = this.getUserCompletionRate(userId);
    if (rate >= 80) return 'excellent';
    if (rate >= 60) return 'active';
    if (rate >= 40) return 'moderate';
    return 'needs-attention';
  }

  // Navigation methods
  navigateToUsers() {
    this.router.navigate(['/admin/users']);
  }

  navigateToShops() {
    this.router.navigate(['/admin/shops']);
  }

  navigateToChannels() {
    this.router.navigate(['/admin/channels']);
  }

  navigateToMediaDashboard() {
    this.router.navigate(['/media']);
  }

  viewUserDetail(userId: number) {
    this.router.navigate(['/admin/users', userId]);
  }

  viewTaskDetail(task: Task) {
    console.log('Viewing task detail:', task);
    // Implementation for task detail modal or navigation
  }

  navigateToTarget(task: Task) {
    if (task.shop) {
      this.router.navigate(['/admin/shops']); // Could add shop detail route
    } else if (task.channel) {
      this.router.navigate(['/admin/channels']); // Could add channel detail route
    }
  }
}