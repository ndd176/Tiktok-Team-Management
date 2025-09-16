import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ShopService, Shop } from '../services/shop.service';

@Component({
  selector: 'app-admin-shops',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="admin-shops">
      <div class="page-header">
        <h1>🏪 Shop Management</h1>
        <button class="btn-primary" (click)="toggleForm()">
          {{showForm ? '✕ Cancel' : '+ Add Shop'}}
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div class="form-container" [class.show]="showForm">
        <form [formGroup]="shopForm" (ngSubmit)="onSubmit()" class="shop-form">
          <h3>{{editingShop ? 'Edit Shop' : 'Add New Shop'}}</h3>
          
          <div class="form-group">
            <label for="name">Name *</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              [class.error]="shopForm.get('name')?.invalid && shopForm.get('name')?.touched"
              placeholder="Enter shop name"
            />
            <div class="error-message" *ngIf="shopForm.get('name')?.invalid && shopForm.get('name')?.touched">
              Name is required (min 2 characters)
            </div>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              formControlName="description"
              [class.error]="shopForm.get('description')?.invalid && shopForm.get('description')?.touched"
              placeholder="Enter shop description"
              rows="3"
            ></textarea>
            <div class="error-message" *ngIf="shopForm.get('description')?.invalid && shopForm.get('description')?.touched">
              Description must not exceed 500 characters
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" [disabled]="shopForm.invalid || loading">
              {{loading ? '⏳ Saving...' : (editingShop ? '✓ Update' : '+ Create')}}
            </button>
            <button type="button" class="btn-cancel" (click)="cancelEdit()">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Shops List -->
      <div class="shops-container">
        <div class="list-header">
          <h2>All Shops ({{shops.length}})</h2>
          <div class="search-box">
            <input
              type="text"
              placeholder="🔍 Search shops..."
              [(ngModel)]="searchTerm"
              (input)="filterShops()"
            />
          </div>
        </div>

        <div class="shops-grid" *ngIf="filteredShops.length > 0">
          <div class="shop-card" *ngFor="let shop of filteredShops">
            <div class="shop-info">
              <div class="shop-avatar">
                {{shop.name.charAt(0).toUpperCase()}}
              </div>
              <div class="shop-details">
                <h3>{{shop.name}}</h3>
                <p>{{shop.description || 'No description'}}</p>
                <span class="shop-id">ID: {{shop.id}}</span>
              </div>
            </div>
            <div class="shop-actions">
              <button class="btn-edit" (click)="editShop(shop)" title="Edit">
                ✏️
              </button>
              <button class="btn-delete" (click)="deleteShop(shop.id)" title="Delete">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredShops.length === 0 && !loading">
          <div class="empty-icon">🏪</div>
          <h3>No shops found</h3>
          <p>{{searchTerm ? 'Try adjusting your search' : 'Start by adding your first shop'}}</p>
        </div>

        <div class="loading-state" *ngIf="loading">
          <div class="spinner"></div>
          <p>Loading shops...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-shops {
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
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
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
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
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
      max-height: 600px;
    }

    .shop-form {
      padding: 2rem;
    }

    .shop-form h3 {
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

    .form-group input, .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .form-group input.error, .form-group textarea.error {
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

    .shops-container {
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
      border-color: #10b981;
    }

    .shops-grid {
      padding: 1rem;
      display: grid;
      gap: 1rem;
    }

    .shop-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .shop-card:hover {
      border-color: #10b981;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .shop-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .shop-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .shop-details h3 {
      margin: 0 0 0.25rem 0;
      color: #1e293b;
      font-weight: 600;
    }

    .shop-details p {
      margin: 0 0 0.25rem 0;
      color: #64748b;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .shop-id {
      font-size: 0.8rem;
      color: #9ca3af;
    }

    .shop-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-edit, .btn-delete {
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.3s ease;
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
      border-top: 4px solid #10b981;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
      
      .shop-card {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
      
      .shop-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class AdminShopsComponent implements OnInit {
  shops: Shop[] = [];
  filteredShops: Shop[] = [];
  shopForm: FormGroup;
  showForm = false;
  editingShop: Shop | null = null;
  loading = false;
  searchTerm = '';

  constructor(
    private shopService: ShopService,
    private fb: FormBuilder
  ) {
    this.shopForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.loadShops();
  }

  loadShops() {
    this.loading = true;
    this.shopService.getShops().subscribe({
      next: (shops: any) => {
        this.shops = shops;
        this.filteredShops = shops;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading shops:', error);
        this.loading = false;
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  editShop(shop: Shop) {
    this.editingShop = shop;
    this.shopForm.patchValue(shop);
    this.showForm = true;
  }

  cancelEdit() {
    this.editingShop = null;
    this.shopForm.reset();
    this.showForm = false;
  }

  onSubmit() {
    if (this.shopForm.valid) {
      this.loading = true;
      const shopData = this.shopForm.value;

      const operation = this.editingShop
        ? this.shopService.updateShop(this.editingShop.id, shopData)
        : this.shopService.addShop(shopData);

      operation.subscribe({
        next: () => {
          this.loadShops();
          this.cancelEdit();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error saving shop:', error);
          this.loading = false;
        }
      });
    }
  }

  deleteShop(id: number) {
    if (confirm('Are you sure you want to delete this shop?')) {
      this.shopService.deleteShop(id).subscribe({
        next: () => {
          this.loadShops();
        },
        error: (error: any) => {
          console.error('Error deleting shop:', error);
        }
      });
    }
  }

  filterShops() {
    if (!this.searchTerm) {
      this.filteredShops = this.shops;
    } else {
      this.filteredShops = this.shops.filter(shop =>
        shop.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (shop.description && shop.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
  }
}