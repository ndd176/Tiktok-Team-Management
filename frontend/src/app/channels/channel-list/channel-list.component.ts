import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService, Channel } from '../../services/channel.service';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel-list.component.html'
})
export class ChannelListComponent {
  @Input() channels: Channel[] = [];

  constructor(private channelService: ChannelService) {}

  updateChannel(channel: Channel) {
    this.channelService.updateChannel(channel.id, channel).subscribe();
  }

  deleteChannel(id: number) {
    this.channelService.deleteChannel(id).subscribe();
  }
}
