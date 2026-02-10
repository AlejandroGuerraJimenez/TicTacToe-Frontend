import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Dirección de tu backend

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { username?: string; email?: string; password: string }): Observable<any> {
    // El backend espera username y password; si usas email, ajusta el endpoint.
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}