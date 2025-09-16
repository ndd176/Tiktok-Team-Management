import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService, Shop } from '../../services/shop.service';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop-list.component.html',
  styleUrls: ['./shop-list.component.css']
})
export class ShopListComponent implements OnInit {
   loading = false;        // trạng thái loading
  errorMessage = '';      // hiển thị lỗi nếu có
  @Input() shops: Shop[] = [];   // 👈 nhận data từ AppComponent

  constructor(private shopService: ShopService) {}

  ngOnInit() {
    this.loadShops();
  }

  // Lấy danh sách shops
  loadShops() {
    this.loading = true;
    this.shopService.getShops().subscribe({
      next: (data: Shop[]) => {
        this.shops = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi load shops:', err);
        this.errorMessage = 'Không thể tải danh sách shop';
        this.loading = false;
      }
    });
  }

  // Cập nhật shop
  updateShop(shop: Shop) {
    this.shopService.updateShop(shop.id, shop).subscribe({
      next: () => this.loadShops(),
      error: (err) => {
        console.error('Lỗi khi update shop:', err);
        this.errorMessage = 'Không thể cập nhật shop';
      }
    });
  }

  // Xóa shop
  deleteShop(id: number) {
    if (!confirm('Bạn có chắc chắn muốn xóa shop này?')) return;

    this.shopService.deleteShop(id).subscribe({
      next: () => this.loadShops(),
      error: (err) => {
        console.error('Lỗi khi xóa shop:', err);
        this.errorMessage = 'Không thể xóa shop';
      }
    });
  }
}
