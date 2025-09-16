import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopFormComponent } from './shops/shop-form/shop-form.component';
import { ShopListComponent } from './shops/shop-list/shop-list.component';
import { UserFormComponent } from './users/user-form/user-form.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { ChannelFormComponent } from './channels/channel-form/channel-form.component';
import { ChannelListComponent } from './channels/channel-list/channel-list.component';
import { ShopService, Shop } from './services/shop.service';
import { UserService, User } from './services/user.service';
import { ChannelService, Channel } from './services/channel.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ShopFormComponent, ShopListComponent,
    UserFormComponent, UserListComponent,
    ChannelFormComponent, ChannelListComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  shops: Shop[] = [];
  users: User[] = [];
  channels: Channel[] = [];

  constructor(
    private shopService: ShopService,
    private userService: UserService,
    private channelService: ChannelService
  ) {}

  ngOnInit() {
    this.reloadShops();
    this.reloadUsers();
    this.reloadChannels();
  }

  reloadShops() {
    this.shopService.getShops().subscribe(data => (this.shops = data));
  }

  reloadUsers() {
    this.userService.getUsers().subscribe(data => (this.users = data));
  }

  reloadChannels() {
    this.channelService.getChannels().subscribe(data => (this.channels = data));
  }
}
