import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService, Channel } from '../../services/channel.service';

@Component({
  selector: 'app-channel-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel-form.component.html'
})
export class ChannelFormComponent {
  newChannel: Partial<Channel> = { name: '', description: '' };

  @Output() channelAdded = new EventEmitter<void>();

  constructor(private channelService: ChannelService) {}

  addChannel() {
    if (!this.newChannel.name) return;
    this.channelService.addChannel(this.newChannel).subscribe(() => {
      this.newChannel = { name: '', description: '' };
      this.channelAdded.emit();
    });
  }
}
