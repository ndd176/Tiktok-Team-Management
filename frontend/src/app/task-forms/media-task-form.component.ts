import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../services/user.service';
import { ChannelService, Channel } from '../services/channel.service';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-media-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="closeForm()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>🎬 Create Media Task</h2>
          <button class="btn-close" (click)="closeForm()">✕</button>
        </div>
        
        <form [formGroup]="mediaForm" (ngSubmit)="onSubmit()" class="media-form">
          <div class="form-body">
            <!-- User Selection -->
            <div class="form-group">
              <label for="userId">Assign to User *</label>
              <select id="userId" formControlName="userId" class="form-select">
                <option value="">Select a user</option>
                <option *ngFor="let user of users" [value]="user.id">
                  {{user.name}} ({{user.email}})
                </option>
              </select>
              <div class="error-message" *ngIf="mediaForm.get('userId')?.invalid && mediaForm.get('userId')?.touched">
                Please select a user
              </div>
            </div>

            <!-- Channel Selection -->
            <div class="form-group">
              <label for="channelId">Channel *</label>
              <select id="channelId" formControlName="channelId" class="form-select">
                <option value="">Select a channel</option>
                <option *ngFor="let channel of channels" [value]="channel.id">
                  {{channel.name}}
                </option>
              </select>
              <div class="error-message" *ngIf="mediaForm.get('channelId')?.invalid && mediaForm.get('channelId')?.touched">
                Please select a channel
              </div>
            </div>

            <!-- Video Quantity -->
            <div class="form-group">
              <label for="videoQuantity">Video Quantity *</label>
              <input
                type="number"
                id="videoQuantity"
                formControlName="videoQuantity"
                class="form-input"
                placeholder="Enter number of videos"
                min="1"
              />
              <div class="error-message" *ngIf="mediaForm.get('videoQuantity')?.invalid && mediaForm.get('videoQuantity')?.touched">
                Please enter a valid quantity
              </div>
            </div>

            <!-- Video Type -->
            <div class="form-group">
              <label for="videoType">Video Type *</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input type="radio" formControlName="videoType" value="main" />
                  <span class="radio-custom"></span>
                  <span class="radio-label">Main Video (Chính)</span>
                </label>
                <label class="radio-option">
                  <input type="radio" formControlName="videoType" value="cover" />
                  <span class="radio-custom"></span>
                  <span class="radio-label">Cover Video (Phủ)</span>
                </label>
              </div>
              <div class="error-message" *ngIf="mediaForm.get('videoType')?.invalid && mediaForm.get('videoType')?.touched">
                Please select a video type
              </div>
            </div>

            <!-- Video Notes -->
            <div class="form-group">
              <label for="videoNotes">Video Notes</label>
              <textarea
                id="videoNotes"
                formControlName="videoNotes"
                class="form-textarea"
                placeholder="Enter detailed notes for video creation"
                rows="4"
              ></textarea>
            </div>

            <!-- Video Format -->
            <div class="form-group">
              <label for="videoFormat">Video Format</label>
              <select id="videoFormat" formControlName="videoFormat" class="form-select">
                <option value="short">Short Video (TikTok/Reels)</option>
                <option value="long">Long Video (YouTube)</option>
                <option value="story">Story Format</option>
                <option value="live">Live Stream</option>
              </select>
            </div>

            <!-- Content Category -->
            <div class="form-group">
              <label for="contentCategory">Content Category</label>
              <select id="contentCategory" formControlName="contentCategory" class="form-select">
                <option value="product-demo">Product Demo</option>
                <option value="tutorial">Tutorial</option>
                <option value="entertainment">Entertainment</option>
                <option value="promotional">Promotional</option>
                <option value="educational">Educational</option>
                <option value="behind-scenes">Behind the Scenes</option>
              </select>
            </div>

            <!-- Priority Level -->
            <div class="form-group">
              <label for="priority">Priority Level</label>
              <select id="priority" formControlName="priority" class="form-select">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <!-- Due Date -->
            <div class="form-group">
              <label for="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                formControlName="dueDate"
                class="form-input"
              />
            </div>

            <!-- Target Audience -->
            <div class="form-group">
              <label for="targetAudience">Target Audience</label>
              <input
                type="text"
                id="targetAudience"
                formControlName="targetAudience"
                class="form-input"
                placeholder="e.g., 18-35 years old, tech enthusiasts"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="closeForm()">
              Cancel
            </button>
            <button type="submit" class="btn-primary" [disabled]="mediaForm.invalid || loading">
              <span *ngIf="loading" class="spinner"></span>
              {{loading ? 'Creating...' : 'Create Task'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
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
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      animation: slideUp 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
      border-radius: 12px 12px 0 0;
    }

    .modal-header h2 {
      margin: 0;
      color: #92400e;
      font-size: 1.5rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #92400e;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .btn-close:hover {
      background: rgba(146, 64, 14, 0.1);
    }

    .form-body {
      padding: 2rem;
      display: grid;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      color: #374151;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .form-input,
    .form-select,
    .form-textarea {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .radio-group {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .radio-option input[type="radio"] {
      display: none;
    }

    .radio-custom {
      width: 20px;
      height: 20px;
      border: 2px solid #d1d5db;
      border-radius: 50%;
      position: relative;
      transition: all 0.3s ease;
    }

    .radio-option input[type="radio"]:checked + .radio-custom {
      border-color: #f59e0b;
      background: #f59e0b;
    }

    .radio-option input[type="radio"]:checked + .radio-custom::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: white;
    }

    .radio-label {
      color: #374151;
      font-weight: 500;
    }

    .error-message {
      color: #dc2626;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem 2rem;
      border-top: 1px solid #e5e7eb;
      background: #f8fafc;
      border-radius: 0 0 12px 12px;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        margin: 1rem;
      }

      .form-body {
        padding: 1.5rem;
      }

      .modal-header,
      .modal-footer {
        padding: 1rem 1.5rem;
      }

      .radio-group {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class MediaTaskFormComponent implements OnInit {
  isVisible = false;
  loading = false;
  users: User[] = [];
  channels: Channel[] = [];

  mediaForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private channelService: ChannelService,
    private taskService: TaskService
  ) {
    this.mediaForm = this.fb.group({
      userId: ['', Validators.required],
      channelId: ['', Validators.required],
      videoQuantity: ['', [Validators.required, Validators.min(1)]],
      videoType: ['', Validators.required],
      videoNotes: [''],
      videoFormat: ['short'],
      contentCategory: ['product-demo'],
      priority: ['medium'],
      dueDate: [''],
      targetAudience: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    
    // Listen for float button events
    window.addEventListener('openTaskForm', (event: any) => {
      if (event.detail.role === 'media') {
        this.openForm();
      }
    });
  }

  loadData() {
    // Load users
    this.userService.getUsers().subscribe({
      next: (users) => this.users = users,
      error: (error) => console.error('Error loading users:', error)
    });

    // Load channels
    this.channelService.getChannels().subscribe({
      next: (channels) => this.channels = channels,
      error: (error) => console.error('Error loading channels:', error)
    });
  }

  openForm() {
    this.isVisible = true;
    this.mediaForm.reset();
    this.mediaForm.patchValue({ 
      videoFormat: 'short',
      contentCategory: 'product-demo',
      priority: 'medium' 
    });
  }

  closeForm() {
    this.isVisible = false;
  }

  onSubmit() {
    if (this.mediaForm.valid) {
      this.loading = true;
      
      const formData = this.mediaForm.value;
      
      // Find selected user and channel
      const selectedUser = this.users.find(user => user.id == formData.userId);
      const selectedChannel = this.channels.find(channel => channel.id == formData.channelId);
      
      if (!selectedUser || !selectedChannel) {
        alert('Please select valid user and channel');
        this.loading = false;
        return;
      }

      // Create task data
      const taskData = {
        title: `${formData.videoType} video for ${selectedChannel.name} - ${formData.videoQuantity} videos`,
        description: `Media task for ${selectedChannel.name}: Create ${formData.videoQuantity} ${formData.videoType} videos (${formData.videoFormat})${formData.videoNotes ? '. Notes: ' + formData.videoNotes : ''}`,
        type: 'media' as const,
        priority: formData.priority,
        assignedTo: {
          id: selectedUser.id,
          name: selectedUser.name
        },
        shop: null,
        channel: selectedChannel,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      // Add task through service
      try {
        const newTask = this.taskService.addTask(taskData);
        console.log('Media task created:', newTask);
        
        setTimeout(() => {
          this.loading = false;
          this.closeForm();
          alert(`Media task created successfully and assigned to ${selectedUser.name}!`);
        }, 1000);
      } catch (error) {
        console.error('Error creating task:', error);
        this.loading = false;
        alert('Error creating task. Please try again.');
      }
    }
  }
}