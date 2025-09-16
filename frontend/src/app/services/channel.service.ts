import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Channel {
  id: number;
  name: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class ChannelService {
  private apiUrl = 'http://localhost:4000/api/channels';

  constructor(private http: HttpClient) {}

  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(this.apiUrl);
  }

  addChannel(channel: Partial<Channel>): Observable<Channel> {
    return this.http.post<Channel>(this.apiUrl, channel);
  }

  updateChannel(id: number, channel: Channel): Observable<Channel> {
    return this.http.put<Channel>(`${this.apiUrl}/${id}`, channel);
  }

  deleteChannel(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }
}
