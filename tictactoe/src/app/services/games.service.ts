import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://tictactoe-backend-production-8a7e.up.railway.app';

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

  getGame(gameId: number): Observable<{ success: boolean; game: any }> {
    return this.http.get<{ success: boolean; game: any }>(`${this.apiUrl}/${gameId}`, { withCredentials: true });
  }

  makeMove(gameId: number, position: number): Observable<{ success: boolean; game: any }> {
    return this.http.post<{ success: boolean; game: any }>(`${this.apiUrl}/${gameId}/move`, { position }, { withCredentials: true });
  }

  getGameChat(gameId: number): Observable<{ success: boolean; chatId: number; opponentUsername: string; messages: any[]; otherLastReadAt: string | null }> {
    return this.http.get<{ success: boolean; chatId: number; opponentUsername: string; messages: any[]; otherLastReadAt: string | null }>(
      `${this.apiUrl}/${gameId}/chat`,
      { withCredentials: true }
    );
  }

  sendChatMessage(gameId: number, content: string): Observable<{ success: boolean; message: any }> {
    return this.http.post<{ success: boolean; message: any }>(
      `${this.apiUrl}/${gameId}/chat/messages`,
      { content },
      { withCredentials: true }
    );
  }
}
