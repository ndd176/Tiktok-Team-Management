import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent {
  @Input() users: User[] = [];

  constructor(private userService: UserService) {}

  updateUser(user: User) {
    this.userService.updateUser(user.id, user).subscribe();
  }

  deleteUser(id: number) {
    this.userService.deleteUser(id).subscribe();
  }
}
