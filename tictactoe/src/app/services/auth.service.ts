import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError, map } from 'rxjs';
import { RealtimeService } from './realtime.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private realtime = inject(RealtimeService);
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isCheckingSession = false;

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, {
      withCredentials: true,
    }).pipe(
      tap((response: any) => {
        if (response.success) {
          this.currentUserSubject.next(response.user);
          this.realtime.connect();
        }
      })
    );
  }

  login(credentials: { username?: string; email?: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, {
      withCredentials: true,
    }).pipe(
      tap((response: any) => {
        if (response.success) {
          this.currentUserSubject.next(response.user);
          this.realtime.connect();
        }
      })
    );
  }

  checkSession(): Observable<boolean> {
    if (this.currentUserSubject.value) {
      return of(true);
    }

    if (this.isCheckingSession) {
      return of(false);
    }

    this.isCheckingSession = true;
    return this.http.get(`${this.apiUrl}/me`, {
      withCredentials: true,
    }).pipe(
      map((response: any) => {
        this.isCheckingSession = false;
        if (response.success) {
          this.currentUserSubject.next(response.user);
          this.realtime.connect();
          return true;
        }
        return false;
      }),
      catchError((error) => {
        this.isCheckingSession = false;
        this.currentUserSubject.next(null);
        return of(false);
      })
    );
  }

  me(): Observable<any> {
    console.log('Calling me() endpoint directly');
    return this.http.get(`${this.apiUrl}/me`, {
      withCredentials: true,
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true,
    }).pipe(
      tap(() => {
        this.realtime.disconnect();
        this.currentUserSubject.next(null);
      }),
      catchError((err) => {
        this.realtime.disconnect();
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.currentUserSubject.value;
    console.log('isAuthenticated check:', isAuth);
    return isAuth;
  }
}