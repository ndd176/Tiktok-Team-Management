import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent {
  newUser: Partial<User> = { name: '', email: '' };

  @Output() userAdded = new EventEmitter<void>();

  constructor(private userService: UserService) {}

  addUser() {
    if (!this.newUser.name || !this.newUser.email) return;
    this.userService.addUser(this.newUser).subscribe(() => {
      this.newUser = { name: '', email: '' };
      this.userAdded.emit();
    });
  }
}
