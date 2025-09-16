import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Shop {
  id: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = 'http://localhost:4000/api/shops';

  constructor(private http: HttpClient) {}

  // Lấy tất cả shops
  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(this.apiUrl);
  }

  // Thêm shop mới
  addShop(shop: Partial<Shop>): Observable<Shop> {
    return this.http.post<Shop>(this.apiUrl, shop);
  }

  // Cập nhật shop
  updateShop(id: number, shop: Shop): Observable<Shop> {
    return this.http.put<Shop>(`${this.apiUrl}/${id}`, shop);
  }

  // Xóa shop
  deleteShop(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }
}
