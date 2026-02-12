import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/games';

  getGames(): Observable<{ success: boolean; games: any[] }> {
    return this.http.get<{ success: boolean; games: any[] }>(`${this.apiUrl}`, { withCredentials: true });
  }

  getInvitations(): Observable<{ success: boolean; invitations: any[] }> {
    return this.http.get<{ success: boolean; invitations: any[] }>(`${this.apiUrl}/invitations`, { withCredentials: true });
  }

  sendInvite(targetUsername: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/invite`, { targetUsername }, { withCredentials: true });
  }

  acceptInvitation(invitationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/invitations/${invitationId}/accept`, {}, { withCredentials: true });
  }

  rejectInvitation(invitationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/invitations/${invitationId}/reject`, {}, { withCredentials: true });
  }
}
