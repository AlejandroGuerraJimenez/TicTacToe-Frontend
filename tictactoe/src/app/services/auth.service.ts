import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError, map } from 'rxjs';
import { RealtimeService } from './realtime.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private realtime = inject(RealtimeService);
  private apiUrl = 'https://tictactoe-backend-production-8a7e.up.railway.app';
  private currentUserSubject = new BehaviorSubject<any>(null);
  /** Signal reactivo: la vista se actualiza al cambiar (p. ej. tras checkSession al recargar). */
  private currentUserSignal = signal<any>(null);
  /** Lectura del usuario actual vía signal (recomendado en templates). */
  public readonly currentUser = this.currentUserSignal.asReadonly();
  public currentUser$ = this.currentUserSubject.asObservable();
  private isCheckingSession = false;

  private setUser(user: any): void {
    this.currentUserSubject.next(user);
    this.currentUserSignal.set(user);
  }

  private saveToken(token: string | undefined): void {
    if (typeof sessionStorage === 'undefined') return;
    if (token) sessionStorage.setItem('token', token);
    else sessionStorage.removeItem('token');
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, {
      withCredentials: true,
    }).pipe(
      tap((response: any) => {
        if (response.success) {
          this.saveToken(response.token);
          this.setUser(response.user);
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
          this.saveToken(response.token);
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
          this.setUser(response.user);
          this.realtime.connect();
          return true;
        }
        return false;
      }),
      catchError((error) => {
        this.isCheckingSession = false;
        this.setUser(null);
        return of(false);
      })
    );
  }

  me(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      withCredentials: true,
    });
  }

  updateProfile(profile: { username?: string; email?: string }): Observable<{ success: boolean; user?: any; error?: string }> {
    return this.http.patch<{ success: boolean; user?: any; error?: string }>(`${this.apiUrl}/me`, profile, {
      withCredentials: true,
    }).pipe(
      tap((res) => {
        if (res.success && res.user) this.setUser(res.user);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true,
    }).pipe(
      tap(() => {
        this.saveToken(undefined);
        this.realtime.disconnect();
        this.setUser(null);
      }),
      catchError((err) => {
        this.saveToken(undefined);
        this.realtime.disconnect();
        this.setUser(null);
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