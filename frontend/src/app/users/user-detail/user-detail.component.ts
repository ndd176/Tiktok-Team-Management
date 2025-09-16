import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-detail">
      <!-- Header with back button -->
      <div class="header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>User Details</h1>
      </div>

      <!-- User Info Card -->
      <div class="user-card" *ngIf="user">
        <div class="user-avatar">{{user.name.charAt(0).toUpperCase()}}</div>
        <div class="user-info">
          <h2>{{user.name}}</h2>
          <p class="user-email">{{user.email}}</p>
          <div class="user-meta">
            <span class="badge" [class]="'badge-' + user.status">{{user.status}}</span>
            <span class="join-date">Joined: {{user.createdAt | date:'mediumDate'}}</span>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-section">
        <h3>Performance Overview</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{userTasks.length}}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{completedTasks}}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{inProgressTasks}}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{pendingTasks}}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{completionRate}}%</div>
            <div class="stat-label">Completion Rate</div>
          </div>
        </div>
      </div>

      <!-- Task History -->
      <div class="tasks-section">
        <h3>Task History</h3>
        <div class="task-filters">
          <button 
            class="filter-btn" 
            [class.active]="taskFilter === 'all'"
            (click)="setTaskFilter('all')">
            All ({{userTasks.length}})
          </button>
          <button 
            class="filter-btn" 
            [class.active]="taskFilter === 'completed'"
            (click)="setTaskFilter('completed')">
            Completed ({{completedTasks}})
          </button>
          <button 
            class="filter-btn" 
            [class.active]="taskFilter === 'in-progress'"
            (click)="setTaskFilter('in-progress')">
            In Progress ({{inProgressTasks}})
          </button>
          <button 
            class="filter-btn" 
            [class.active]="taskFilter === 'pending'"
            (click)="setTaskFilter('pending')">
            Pending ({{pendingTasks}})
          </button>
        </div>

        <div class="tasks-list">
          <div 
            class="task-item" 
            *ngFor="let task of filteredTasks"
            [class]="'task-' + task.status">
            <div class="task-header">
              <h4>{{task.title}}</h4>
              <span class="task-badge" [class]="'badge-' + task.status">{{task.status}}</span>
            </div>
            <p class="task-description">{{task.description}}</p>
            <div class="task-meta">
              <span class="task-type">{{task.type | titlecase}}</span>
              <span class="task-priority" [class]="'priority-' + task.priority">{{task.priority | titlecase}}</span>
              <span class="task-date">{{task.createdAt | date:'short'}}</span>
            </div>
            <div class="task-progress" *ngIf="task.status === 'in-progress'">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="task.progress"></div>
              </div>
              <span class="progress-text">{{task.progress}}%</span>
            </div>
          </div>
        </div>

        <div class="no-tasks" *ngIf="filteredTasks.length === 0">
          <p>No tasks found for the selected filter.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-detail {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .back-btn {
      background: #f3f4f6;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .back-btn:hover {
      background: #e5e7eb;
    }

    .user-card {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-weight: bold;
    }

    .user-info h2 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .user-email {
      color: #6b7280;
      margin: 0 0 1rem 0;
    }

    .user-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .badge-active {
      background: #dcfce7;
      color: #166534;
    }

    .badge-inactive {
      background: #fef2f2;
      color: #991b1b;
    }

    .join-date {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .stats-section {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .stats-section h3 {
      margin: 0 0 1.5rem 0;
      color: #1f2937;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1.5rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 0.5rem;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .tasks-section {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .tasks-section h3 {
      margin: 0 0 1.5rem 0;
      color: #1f2937;
    }

    .task-filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      background: #f3f4f6;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: #e5e7eb;
    }

    .filter-btn.active {
      background: #3b82f6;
      color: white;
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .task-item {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1.5rem;
      transition: border-color 0.2s;
    }

    .task-item:hover {
      border-color: #d1d5db;
    }

    .task-completed {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .task-in-progress {
      background: #fffbeb;
      border-color: #fed7aa;
    }

    .task-pending {
      background: #fef2f2;
      border-color: #fecaca;
    }

    .task-header {
      display: flex;
      justify-content: between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .task-header h4 {
      margin: 0;
      color: #1f2937;
      flex: 1;
    }

    .task-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-completed {
      background: #dcfce7;
      color: #166534;
    }

    .badge-in-progress {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-pending {
      background: #fecaca;
      color: #991b1b;
    }

    .task-description {
      color: #6b7280;
      margin: 0 0 1rem 0;
    }

    .task-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .task-type {
      background: #e0e7ff;
      color: #3730a3;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .priority-high {
      background: #fecaca;
      color: #991b1b;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .priority-medium {
      background: #fef3c7;
      color: #92400e;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .priority-low {
      background: #dcfce7;
      color: #166534;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .task-date {
      color: #6b7280;
    }

    .task-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #3b82f6;
      transition: width 0.3s;
    }

    .progress-text {
      font-size: 0.75rem;
      color: #6b7280;
      min-width: 35px;
    }

    .no-tasks {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .user-detail {
        padding: 1rem;
      }

      .user-card {
        flex-direction: column;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .task-filters {
        flex-direction: column;
      }

      .task-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .task-meta {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class UserDetailComponent implements OnInit {
  user: any = null;
  userTasks: Task[] = [];
  filteredTasks: Task[] = [];
  taskFilter: string = 'all';
  
  completedTasks = 0;
  inProgressTasks = 0;
  pendingTasks = 0;
  completionRate = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUserData(userId);
    this.loadUserTasks(userId);
  }

  loadUserData(userId: number) {
    this.userService.getUsers().subscribe(users => {
      this.user = users.find(u => u.id === userId);
      if (!this.user) {
        this.router.navigate(['/admin/users']);
      }
    });
  }

  loadUserTasks(userId: number) {
    this.taskService.getTasks().subscribe(tasks => {
      this.userTasks = tasks.filter(task => task.assignedTo.id === userId);
      this.calculateStats();
      this.filterTasks();
    });
  }

  calculateStats() {
    this.completedTasks = this.userTasks.filter(task => task.status === 'completed').length;
    this.inProgressTasks = this.userTasks.filter(task => task.status === 'in-progress').length;
    this.pendingTasks = this.userTasks.filter(task => task.status === 'pending').length;
    
    this.completionRate = this.userTasks.length > 0 
      ? Math.round((this.completedTasks / this.userTasks.length) * 100)
      : 0;
  }

  setTaskFilter(filter: string) {
    this.taskFilter = filter;
    this.filterTasks();
  }

  filterTasks() {
    if (this.taskFilter === 'all') {
      this.filteredTasks = [...this.userTasks];
    } else {
      this.filteredTasks = this.userTasks.filter(task => task.status === this.taskFilter);
    }
  }

  goBack() {
    this.router.navigate(['/admin/users']);
  }
}