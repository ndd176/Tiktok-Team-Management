import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService, Shop } from '../../services/shop.service';

@Component({
  selector: 'app-shop-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop-form.component.html'
})
export class ShopFormComponent {
  newShop: Partial<Shop> = { name: '', description: '' };

  @Output() shopAdded = new EventEmitter<void>(); // 👈 khi thêm xong thì bắn event

  constructor(private shopService: ShopService) {}

  addShop() {
    if (!this.newShop.name) return;
    this.shopService.addShop(this.newShop).subscribe(() => {
      this.newShop = { name: '', description: '' };
      this.shopAdded.emit(); // 👈 bắn tín hiệu cho cha biết đã thêm
    });
  }
}
