import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://tictactoe-backend-production-8a7e.up.railway.app';
  private friendsUrl = `${this.apiUrl}/friends`;

  getFriends(): Observable<any> {
    return this.http.get(`${this.friendsUrl}`, { withCredentials: true });
  }

  getRequests(): Observable<any> {
    return this.http.get(`${this.friendsUrl}/requests`, { withCredentials: true });
  }

  sendRequest(targetUsername: string): Observable<any> {
    return this.http.post(`${this.friendsUrl}/request`, { targetUsername }, { withCredentials: true });
  }

  acceptRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.friendsUrl}/accept/${requestId}`, {}, { withCredentials: true });
  }

  rejectRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.friendsUrl}/reject/${requestId}`, {}, { withCredentials: true });
  }

  removeFriend(friendId: number): Observable<any> {
    return this.http.delete(`${this.friendsUrl}/${friendId}`, { withCredentials: true });
  }
}
