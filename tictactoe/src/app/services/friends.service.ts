import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/friends';

  getFriends(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { withCredentials: true });
  }

  getRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/requests`, { withCredentials: true });
  }

  sendRequest(targetUsername: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, { targetUsername }, { withCredentials: true });
  }

  acceptRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/accept/${requestId}`, {}, { withCredentials: true });
  }

  rejectRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reject/${requestId}`, {}, { withCredentials: true });
  }

  removeFriend(friendId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${friendId}`, { withCredentials: true });
  }
}
