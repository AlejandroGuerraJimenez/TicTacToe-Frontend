import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Dirección de tu backend
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isCheckingSession = false;

  constructor(private http: HttpClient) {
    // Opcional: intentar recuperar sesión al iniciar, aunque el guard lo hará también
    // this.checkSession().subscribe(); 
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, {
      withCredentials: true,
    }).pipe(
      tap((response: any) => {
        if (response.success) {
          console.log('Register successful, updating user state:', response.user);
          this.currentUserSubject.next(response.user);
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
          console.log('Login successful, updating user state:', response.user);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  checkSession(): Observable<boolean> {
    if (this.currentUserSubject.value) {
      console.log('User already authenticated in local state');
      return of(true);
    }

    if (this.isCheckingSession) {
      console.log('Already checking session, returning false to avoid loop');
      return of(false); // Evitar llamadas duplicadas, aunque simple por ahora
    }

    this.isCheckingSession = true;
    console.log('Checking session with backend...');
    return this.http.get(`${this.apiUrl}/me`, {
      withCredentials: true,
    }).pipe(
      map((response: any) => {
        this.isCheckingSession = false;
        if (response.success) {
          console.log('Session valid, user:', response.user);
          this.currentUserSubject.next(response.user);
          return true;
        }
        console.log('Session invalid (response success=false)');
        return false;
      }),
      catchError((error) => {
        this.isCheckingSession = false;
        console.error('Session check failed:', error);
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
    console.log('Logging out...');
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      withCredentials: true,
    }).pipe(
      tap(() => {
        console.log('Logout successful, clearing state');
        this.currentUserSubject.next(null);
      }),
      catchError((err) => {
        console.error('Logout error', err);
        // Incluso si falla el backend, limpiamos el estado local
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