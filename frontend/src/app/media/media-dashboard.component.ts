import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService, Task } from '../services/task.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-media-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="media-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>🎥 Media Dashboard</h1>
        <div class="user-info">
          <span class="welcome">Welcome, {{currentUser?.name || 'Media User'}}</span>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-number">{{myTasks.length}}</div>
          <div class="stat-label">Total Videos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{completedTasks}}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{pendingTasks}}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{completionRate}}%</div>
          <div class="stat-label">Completion Rate</div>
        </div>
      </div>

      <!-- Video Tasks Grid -->
      <div class="video-tasks-section">
        <h2>📹 My Video Tasks</h2>
        
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            [class.active]="currentFilter === 'all'"
            (click)="setFilter('all')">
            All Videos ({{myTasks.length}})
          </button>
          <button 
            class="filter-tab" 
            [class.active]="currentFilter === 'pending'"
            (click)="setFilter('pending')">
            Pending ({{pendingTasks}})
          </button>
          <button 
            class="filter-tab" 
            [class.active]="currentFilter === 'in-progress'"
            (click)="setFilter('in-progress')">
            In Progress ({{inProgressTasks}})
          </button>
          <button 
            class="filter-tab" 
            [class.active]="currentFilter === 'completed'"
            (click)="setFilter('completed')">
            Completed ({{completedTasks}})
          </button>
        </div>

        <div class="video-grid" *ngIf="filteredTasks.length > 0">
          <div 
            class="video-card" 
            *ngFor="let task of filteredTasks; let i = index"
            [class.completed]="task.status === 'completed'"
            [class.in-progress]="task.status === 'in-progress'"
            [class.pending]="task.status === 'pending'">
            
            <!-- Video Card Header -->
            <div class="card-header">
              <div class="video-code">{{generateVideoCode(task, i)}}</div>
              <div class="status-badge" [class]="'status-' + task.status">
                {{getStatusIcon(task.status)}} {{task.status | titlecase}}
              </div>
            </div>

            <!-- Video Info -->
            <div class="video-info">
              <h3 class="video-title">{{task.title}}</h3>
              <p class="video-description">{{task.description}}</p>
              <div class="video-meta">
                <span class="channel-name">📺 {{task.channel?.name || 'Unknown Channel'}}</span>
                <span class="due-date" [class.overdue]="isOverdue(task.dueDate)">
                  📅 Due: {{task.dueDate | date:'dd/MM/yyyy'}}
                </span>
                <span class="priority" [class]="'priority-' + task.priority">
                  {{getPriorityIcon(task.priority)}} {{task.priority | titlecase}}
                </span>
              </div>
            </div>

            <!-- Progress Bar (for in-progress tasks) -->
            <div class="progress-section" *ngIf="task.status === 'in-progress'">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="task.progress"></div>
              </div>
              <span class="progress-text">{{task.progress}}% Complete</span>
            </div>

            <!-- Action Buttons -->
            <div class="card-actions">
              <button 
                class="btn-start" 
                *ngIf="task.status === 'pending'"
                (click)="startTask(task)">
                ▶️ Start Working
              </button>
              
              <button 
                class="btn-progress" 
                *ngIf="task.status === 'in-progress'"
                (click)="updateProgress(task)">
                📈 Update Progress
              </button>
              
              <button 
                class="btn-complete" 
                *ngIf="task.status === 'in-progress' && task.progress >= 90"
                (click)="completeTask(task)">
                ✅ Mark Complete
              </button>

              <button 
                class="btn-completed" 
                *ngIf="task.status === 'completed'"
                disabled>
                ✅ Completed
              </button>

              <button 
                class="btn-details" 
                (click)="viewTaskDetails(task)">
                👁️ Details
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredTasks.length === 0">
          <div class="empty-icon">🎬</div>
          <h3>No video tasks found</h3>
          <p *ngIf="currentFilter === 'all'">You don't have any video tasks assigned yet.</p>
          <p *ngIf="currentFilter !== 'all'">No tasks with "{{currentFilter}}" status.</p>
        </div>
      </div>

      <!-- Today's Progress -->
      <div class="daily-progress">
        <h3>📊 Today's Progress</h3>
        <div class="progress-summary">
          <div class="daily-stat">
            <span class="label">Videos Completed Today:</span>
            <span class="value">{{todayCompletedCount}}</span>
          </div>
          <div class="daily-stat">
            <span class="label">Total Progress:</span>
            <span class="value">{{overallProgress}}%</span>
          </div>
          <div class="daily-stat">
            <span class="label">Time Remaining:</span>
            <span class="value">{{estimatedTimeRemaining}} hours</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Update Modal -->
    <div class="modal-overlay" *ngIf="showProgressModal" (click)="closeProgressModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Update Progress</h3>
          <button class="btn-close" (click)="closeProgressModal()">✕</button>
        </div>
        <div class="modal-body">
          <p>Current progress: <strong>{{selectedTask?.progress || 0}}%</strong></p>
          <div class="progress-input">
            <label for="progressRange">New Progress:</label>
            <input 
              type="range" 
              id="progressRange"
              min="0" 
              max="100" 
              [(ngModel)]="newProgress"
              (input)="onProgressChange($event)">
            <span class="progress-value">{{newProgress}}%</span>
          </div>
          <div class="quick-progress">
            <button class="quick-btn" (click)="setQuickProgress(25)">25%</button>
            <button class="quick-btn" (click)="setQuickProgress(50)">50%</button>
            <button class="quick-btn" (click)="setQuickProgress(75)">75%</button>
            <button class="quick-btn" (click)="setQuickProgress(90)">90%</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="closeProgressModal()">Cancel</button>
          <button class="btn-save" (click)="saveProgress()">Update Progress</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .media-dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      background: #f8fafc;
      min-height: 100vh;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem 2rem;
      border-radius: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .dashboard-header h1 {
      margin: 0;
      color: #1f2937;
      font-size: 2rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome {
      color: #6b7280;
      font-weight: 500;
    }

    .btn-logout {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-logout:hover {
      background: #dc2626;
    }

    /* Stats Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #8b5cf6;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #6b7280;
      font-weight: 500;
    }

    /* Video Tasks Section */
    .video-tasks-section {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .video-tasks-section h2 {
      margin: 0 0 1.5rem 0;
      color: #1f2937;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-tab {
      background: #f3f4f6;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .filter-tab:hover {
      background: #e5e7eb;
    }

    .filter-tab.active {
      background: #8b5cf6;
      color: white;
    }

    /* Video Grid */
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .video-card {
      background: #f8fafc;
      border: 2px solid #e5e7eb;
      border-radius: 1rem;
      padding: 1.5rem;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }

    .video-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .video-card.pending {
      border-color: #fbbf24;
      background: linear-gradient(135deg, #fef3c7 0%, #f9fafb 100%);
    }

    .video-card.in-progress {
      border-color: #3b82f6;
      background: linear-gradient(135deg, #dbeafe 0%, #f9fafb 100%);
    }

    .video-card.completed {
      border-color: #10b981;
      background: linear-gradient(135deg, #d1fae5 0%, #f9fafb 100%);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .video-code {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      font-size: 1.1rem;
      color: #374151;
      background: rgba(255, 255, 255, 0.8);
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #d1d5db;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .status-pending {
      background: #fbbf24;
      color: white;
    }

    .status-in-progress {
      background: #3b82f6;
      color: white;
    }

    .status-completed {
      background: #10b981;
      color: white;
    }

    .video-info h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.125rem;
    }

    .video-description {
      color: #6b7280;
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .video-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .channel-name {
      color: #7c3aed;
      font-weight: 500;
    }

    .due-date {
      color: #374151;
    }

    .due-date.overdue {
      color: #dc2626;
      font-weight: 600;
    }

    .priority {
      font-weight: 500;
    }

    .priority-high {
      color: #dc2626;
    }

    .priority-medium {
      color: #f59e0b;
    }

    .priority-low {
      color: #10b981;
    }

    /* Progress Section */
    .progress-section {
      margin: 1rem 0;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 0.5rem;
    }

    .progress-bar {
      width: 100%;
      height: 12px;
      background: #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      transition: width 0.5s ease;
    }

    .progress-text {
      font-size: 0.875rem;
      color: #374151;
      font-weight: 500;
    }

    /* Card Actions */
    .card-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1.5rem;
      flex-wrap: wrap;
    }

    .card-actions button {
      flex: 1;
      min-width: 100px;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      font-size: 0.875rem;
    }

    .btn-start {
      background: #10b981;
      color: white;
    }

    .btn-start:hover {
      background: #059669;
    }

    .btn-progress {
      background: #3b82f6;
      color: white;
    }

    .btn-progress:hover {
      background: #2563eb;
    }

    .btn-complete {
      background: #8b5cf6;
      color: white;
    }

    .btn-complete:hover {
      background: #7c3aed;
    }

    .btn-completed {
      background: #6b7280;
      color: white;
      cursor: not-allowed;
    }

    .btn-details {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-details:hover {
      background: #e5e7eb;
    }

    /* Daily Progress */
    .daily-progress {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .daily-progress h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
    }

    .progress-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .daily-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 0.5rem;
    }

    .daily-stat .label {
      color: #6b7280;
    }

    .daily-stat .value {
      font-weight: bold;
      color: #1f2937;
      font-size: 1.125rem;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      padding: 0;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      color: #1f2937;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .progress-input {
      margin: 1rem 0;
    }

    .progress-input label {
      display: block;
      margin-bottom: 0.5rem;
      color: #374151;
      font-weight: 500;
    }

    .progress-input input[type="range"] {
      width: 100%;
      margin: 0.5rem 0;
    }

    .progress-value {
      font-weight: bold;
      color: #8b5cf6;
    }

    .quick-progress {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .quick-btn {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .quick-btn:hover {
      background: #e5e7eb;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      justify-content: flex-end;
    }

    .btn-cancel {
      background: #6b7280;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .btn-save {
      background: #8b5cf6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .media-dashboard {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .video-grid {
        grid-template-columns: 1fr;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .progress-summary {
        grid-template-columns: 1fr;
      }

      .card-actions {
        flex-direction: column;
      }

      .card-actions button {
        flex: none;
      }
    }
  `]
})
export class MediaDashboardComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  myTasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentFilter: string = 'all';
  
  completedTasks = 0;
  pendingTasks = 0;
  inProgressTasks = 0;
  completionRate = 0;
  todayCompletedCount = 0;
  overallProgress = 0;
  estimatedTimeRemaining = 0;

  showProgressModal = false;
  selectedTask: Task | null = null;
  newProgress = 0;

  private tasksSubscription: Subscription = new Subscription();

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadMyTasks();
  }

  ngOnDestroy() {
    this.tasksSubscription.unsubscribe();
  }

  loadCurrentUser() {
    // In real app, get from auth service
    // For demo, assume user ID 1 is the current media user
    this.userService.getUsers().subscribe(users => {
      this.currentUser = users.find(u => u.id === 1) || users[0];
    });
  }

  loadMyTasks() {
    this.tasksSubscription = this.taskService.getTasks().subscribe(tasks => {
      // Filter tasks assigned to current user and media type
      this.myTasks = tasks.filter(task => 
        task.assignedTo.id === (this.currentUser?.id || 1) && 
        task.type === 'media'
      );
      this.calculateStats();
      this.filterTasks();
    });
  }

  calculateStats() {
    this.completedTasks = this.myTasks.filter(t => t.status === 'completed').length;
    this.pendingTasks = this.myTasks.filter(t => t.status === 'pending').length;
    this.inProgressTasks = this.myTasks.filter(t => t.status === 'in-progress').length;
    
    this.completionRate = this.myTasks.length > 0 
      ? Math.round((this.completedTasks / this.myTasks.length) * 100)
      : 0;

    // Calculate today's completed tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayCompletedCount = this.myTasks.filter(task => {
      if (task.status !== 'completed') return false;
      const completedDate = new Date(task.createdAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    }).length;

    // Calculate overall progress
    const totalProgress = this.myTasks.reduce((sum, task) => sum + task.progress, 0);
    this.overallProgress = this.myTasks.length > 0 
      ? Math.round(totalProgress / this.myTasks.length)
      : 0;

    // Estimate remaining time (simplified calculation)
    const remainingTasks = this.pendingTasks + this.inProgressTasks;
    this.estimatedTimeRemaining = Math.round(remainingTasks * 2.5); // Assume 2.5 hours per video
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.filterTasks();
  }

  filterTasks() {
    if (this.currentFilter === 'all') {
      this.filteredTasks = [...this.myTasks];
    } else {
      this.filteredTasks = this.myTasks.filter(task => task.status === this.currentFilter);
    }
  }

  generateVideoCode(task: Task, index: number): string {
    const today = new Date();
    const dateStr = today.getDate().toString().padStart(2, '0') + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getFullYear().toString().slice(-2);
    
    const channelName = task.channel?.name || 'Unknown Channel';
    const taskIndex = index + 1;
    
    return `VID${dateStr}-${channelName}-${taskIndex}`;
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'pending': return '⏳';
      case 'in-progress': return '🎬';
      case 'completed': return '✅';
      default: return '📋';
    }
  }

  getPriorityIcon(priority: string): string {
    switch(priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  startTask(task: Task) {
    this.taskService.updateTask(task.id, { status: 'in-progress', progress: 10 });
  }

  updateProgress(task: Task) {
    this.selectedTask = task;
    this.newProgress = task.progress;
    this.showProgressModal = true;
  }

  completeTask(task: Task) {
    this.taskService.updateTask(task.id, { status: 'completed', progress: 100 });
  }

  viewTaskDetails(task: Task) {
    // Navigate to task detail view or show modal
    console.log('View task details:', task);
  }

  closeProgressModal() {
    this.showProgressModal = false;
    this.selectedTask = null;
  }

  onProgressChange(event: any) {
    this.newProgress = parseInt(event.target.value);
  }

  setQuickProgress(progress: number) {
    this.newProgress = progress;
  }

  saveProgress() {
    if (this.selectedTask) {
      this.taskService.updateTask(this.selectedTask.id, { progress: this.newProgress });
      this.closeProgressModal();
    }
  }

  logout() {
    // In real app, handle logout through auth service
    this.router.navigate(['/admin/dashboard']);
  }
}