import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="admin-users">
      <div class="page-header">
        <h1>👥 User Management</h1>
        <button class="btn-primary" (click)="toggleForm()">
          {{showForm ? '✕ Cancel' : '+ Add User'}}
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div class="form-container" [class.show]="showForm">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
          <h3>{{editingUser ? 'Edit User' : 'Add New User'}}</h3>
          
          <div class="form-group">
            <label for="name">Name *</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              [class.error]="userForm.get('name')?.invalid && userForm.get('name')?.touched"
              placeholder="Enter user name"
            />
            <div class="error-message" *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched">
              Name is required (min 2 characters)
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
              placeholder="Enter user email"
            />
            <div class="error-message" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
              Valid email is required
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" [disabled]="userForm.invalid || loading">
              {{loading ? '⏳ Saving...' : (editingUser ? '✓ Update' : '+ Create')}}
            </button>
            <button type="button" class="btn-cancel" (click)="cancelEdit()">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Users List -->
      <div class="users-container">
        <div class="list-header">
          <h2>All Users ({{users.length}})</h2>
          <div class="search-box">
            <input
              type="text"
              placeholder="🔍 Search users..."
              [(ngModel)]="searchTerm"
              (input)="filterUsers()"
            />
          </div>
        </div>

        <div class="users-grid" *ngIf="filteredUsers.length > 0">
          <div class="user-card" *ngFor="let user of filteredUsers">
            <div class="user-info">
              <div class="user-avatar">
                {{user.name.charAt(0).toUpperCase()}}
              </div>
              <div class="user-details">
                <h3>{{user.name}}</h3>
                <p>{{user.email}}</p>
                <span class="user-id">ID: {{user.id}}</span>
              </div>
            </div>
            <div class="user-actions">
              <button class="btn-view" (click)="viewUser(user)" title="View Details">
                👁️
              </button>
              <button class="btn-edit" (click)="editUser(user)" title="Edit">
                ✏️
              </button>
              <button class="btn-delete" (click)="deleteUser(user.id)" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredUsers.length === 0 && !loading">
          <div class="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>{{searchTerm ? 'Try adjusting your search' : 'Start by adding your first user'}}</p>
        </div>

        <div class="loading-state" *ngIf="loading">
          <div class="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>

      <!-- User Detail Modal -->
      <div class="modal-overlay" *ngIf="showDetail" (click)="closeDetail()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>👤 User Details</h2>
            <button class="btn-close" (click)="closeDetail()">✕</button>
          </div>
          <div class="modal-body" *ngIf="selectedUser">
            <div class="detail-section">
              <div class="user-avatar-large">
                {{selectedUser.name.charAt(0).toUpperCase()}}
              </div>
              <div class="user-info">
                <h3>{{selectedUser.name}}</h3>
                <p class="user-email">{{selectedUser.email}}</p>
                <span class="user-id-badge">ID: {{selectedUser.id}}</span>
              </div>
            </div>
            
            <div class="detail-grid">
              <div class="detail-item">
                <label>Full Name</label>
                <div class="detail-value">{{selectedUser.name}}</div>
              </div>
              <div class="detail-item">
                <label>Email Address</label>
                <div class="detail-value">{{selectedUser.email}}</div>
              </div>
              <div class="detail-item">
                <label>User ID</label>
                <div class="detail-value">{{selectedUser.id}}</div>
              </div>
              <div class="detail-item">
                <label>Account Status</label>
                <div class="detail-value">
                  <span class="status-badge active">Active</span>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn-edit" (click)="editUser(selectedUser)">
                ✏️ Edit User
              </button>
              <button class="btn-delete" (click)="deleteUser(selectedUser.id)">
                🗑️ Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-users {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    }

    .form-container {
      background: white;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      overflow: hidden;
      max-height: 0;
      transition: all 0.3s ease;
    }

    .form-container.show {
      max-height: 500px;
    }

    .user-form {
      padding: 2rem;
    }

    .user-form h3 {
      margin: 0 0 1.5rem 0;
      color: #1e293b;
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #374151;
      font-weight: 600;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group input.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-submit {
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #374151;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .users-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
      border-bottom: 1px solid #e5e7eb;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .list-header h2 {
      margin: 0;
      color: #1e293b;
      font-size: 1.5rem;
    }

    .search-box input {
      padding: 0.5rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      width: 250px;
      font-size: 1rem;
    }

    .search-box input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .users-grid {
      padding: 1rem;
      display: grid;
      gap: 1rem;
    }

    .user-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .user-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .user-details h3 {
      margin: 0 0 0.25rem 0;
      color: #1e293b;
      font-weight: 600;
    }

    .user-details p {
      margin: 0 0 0.25rem 0;
      color: #64748b;
    }

    .user-id {
      font-size: 0.8rem;
      color: #9ca3af;
    }

    .user-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-edit, .btn-delete, .btn-view {
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.3s ease;
    }

    .btn-view:hover {
      background: #e0f2fe;
    }

    .btn-edit:hover {
      background: #fef3c7;
    }

    .btn-delete:hover {
      background: #fee2e2;
    }

    .empty-state, .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #64748b;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
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
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      animation: slideUp 0.3s ease;
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
    }

    .modal-header h2 {
      margin: 0;
      color: #1e293b;
      font-size: 1.5rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #64748b;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .btn-close:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .modal-body {
      padding: 2rem;
    }

    .detail-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e5e7eb;
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

    .user-info h3 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
      font-size: 1.5rem;
    }

    .user-email {
      margin: 0 0 0.5rem 0;
      color: #64748b;
      font-size: 1rem;
    }

    .user-id-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .detail-item label {
      display: block;
      color: #374151;
      font-weight: 600;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-value {
      color: #1e293b;
      font-size: 1rem;
      font-weight: 500;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .status-badge.active {
      background: #dcfce7;
      color: #166534;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .modal-actions .btn-edit,
    .modal-actions .btn-delete {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modal-actions .btn-edit {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fbbf24;
    }

    .modal-actions .btn-edit:hover {
      background: #fbbf24;
      color: white;
    }

    .modal-actions .btn-delete {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #f87171;
    }

    .modal-actions .btn-delete:hover {
      background: #dc2626;
      color: white;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .list-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .search-box input {
        width: 100%;
      }
      
      .user-card {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
      
      .user-actions {
        align-self: flex-end;
      }

      .modal-content {
        width: 95%;
        margin: 1rem;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .detail-section {
        flex-direction: column;
        text-align: center;
      }

      .detail-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  userForm: FormGroup;
  showForm = false;
  showDetail = false;
  editingUser: User | null = null;
  selectedUser: User | null = null;
  loading = false;
  searchTerm = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.showDetail = false;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  viewUser(user: User) {
    this.router.navigate(['/admin/users', user.id]);
  }

  closeDetail() {
    this.showDetail = false;
    this.selectedUser = null;
  }

  editUser(user: User) {
    this.editingUser = user;
    this.userForm.patchValue(user);
    this.showForm = true;
    this.showDetail = false;
  }

  cancelEdit() {
    this.editingUser = null;
    this.userForm.reset();
    this.showForm = false;
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;
      const userData = this.userForm.value;

      const operation = this.editingUser
        ? this.userService.updateUser(this.editingUser.id, userData)
        : this.userService.addUser(userData);

      operation.subscribe({
        next: () => {
          this.loadUsers();
          this.cancelEdit();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error saving user:', error);
          this.loading = false;
        }
      });
    }
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          if (this.selectedUser?.id === id) {
            this.closeDetail();
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  filterUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
}