import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-float-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="float-button-container">
      <!-- Main Float Button -->
      <button class="float-btn main" 
              [class.active]="isOpen" 
              (click)="toggleMenu()">
        <span class="icon" [class.rotated]="isOpen">+</span>
      </button>

      <!-- Role Options -->
      <div class="role-options" [class.show]="isOpen">
        <button class="float-btn role-btn support" 
                (click)="selectRole('support')"
                title="Create Support Task">
          <span class="icon">🛠️</span>
          <span class="label">Support</span>
        </button>
        
        <button class="float-btn role-btn media" 
                (click)="selectRole('media')"
                title="Create Media Task">
          <span class="icon">🎬</span>
          <span class="label">Media</span>
        </button>
      </div>

      <!-- Backdrop -->
      <div class="backdrop" 
           [class.show]="isOpen" 
           (click)="closeMenu()"></div>
    </div>
  `,
  styles: [`
    .float-button-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
    }

    .float-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      position: relative;
      overflow: hidden;
    }

    .float-btn.main {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      font-size: 1.5rem;
      font-weight: 300;
      transform: scale(1);
    }

    .float-btn.main:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    }

    .float-btn.main.active {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .icon {
      transition: transform 0.3s ease;
    }

    .icon.rotated {
      transform: rotate(45deg);
    }

    .role-options {
      position: absolute;
      bottom: 80px;
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }

    .role-options.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .role-btn {
      width: auto;
      min-width: 60px;
      padding: 0 1rem;
      border-radius: 30px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      transform: scale(0);
      animation-fill-mode: forwards;
    }

    .role-options.show .role-btn {
      animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .role-options.show .role-btn:nth-child(1) {
      animation-delay: 0.1s;
    }

    .role-options.show .role-btn:nth-child(2) {
      animation-delay: 0.15s;
    }

    @keyframes scaleIn {
      to {
        transform: scale(1);
      }
    }

    .role-btn.support {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .role-btn.support:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: scale(1.05);
    }

    .role-btn.media {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .role-btn.media:hover {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      transform: scale(1.05);
    }

    .label {
      white-space: nowrap;
    }

    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    .backdrop.show {
      opacity: 1;
      pointer-events: auto;
    }

    @media (max-width: 768px) {
      .float-button-container {
        bottom: 1.5rem;
        right: 1.5rem;
      }

      .float-btn {
        width: 50px;
        height: 50px;
      }

      .float-btn.main {
        font-size: 1.25rem;
      }

      .role-btn {
        min-width: 50px;
        padding: 0 0.75rem;
        font-size: 0.75rem;
      }

      .role-options {
        bottom: 70px;
      }
    }
  `]
})
export class FloatButtonComponent {
  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  closeMenu() {
    this.isOpen = false;
  }

  selectRole(role: 'support' | 'media') {
    console.log('Selected role:', role);
    this.closeMenu();
    
    // Emit event or navigate to form
    // You can emit an event here to parent component
    // or use a service to open the appropriate form modal
    
    // For now, we'll dispatch a custom event
    window.dispatchEvent(new CustomEvent('openTaskForm', { 
      detail: { role } 
    }));
  }
}