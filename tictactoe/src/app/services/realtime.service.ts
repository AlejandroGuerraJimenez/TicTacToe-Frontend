import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, firstValueFrom } from 'rxjs';

export type RealtimeEvent =
  | { event: 'friend_request'; data: { senderId: number; senderName: string } }
  | { event: 'friend_accepted'; data: { userId: number; username: string } }
  | { event: 'friend_rejected'; data: { userId: number; username: string } }
  | { event: 'friend_removed'; data: { userId: number } }
  | { event: 'game_move'; data: { gameId: number; opponentUsername: string } }
  | { event: 'game_invitation'; data: { senderId: number; senderName: string } }
  | { event: 'game_invitation_accepted'; data: { gameId: number; opponentUsername: string } };

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private http = inject(HttpClient);
  private ngZone = inject(NgZone);
  private apiUrl = 'http://localhost:3000';
  private ws: WebSocket | null = null;
  private readonly eventsSubject = new Subject<RealtimeEvent>();

  readonly events$: Observable<RealtimeEvent> = this.eventsSubject.asObservable();

  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[Realtime] WS ya abierto, no se reconecta');
      return;
    }
    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('[Realtime] WS ya conectando, se ignora segunda llamada');
      return;
    }
    try {
      const res = await firstValueFrom(
        this.http.get<{ token: string }>(`${this.apiUrl}/ws-token`, { withCredentials: true })
      );
      const token = res?.token;
      if (!token) return;
      const wsUrl = this.apiUrl.replace(/^http/, 'ws') + '/ws';
      this.ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        console.log('[Realtime] WebSocket conectado');
      };
      this.ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as RealtimeEvent;
          if (msg?.event) {
            console.log('[Realtime] Mensaje recibido:', msg.event, msg.data);
            this.ngZone.run(() => this.eventsSubject.next(msg));
          }
        } catch (err) {
          console.warn('[Realtime] Error parseando mensaje:', e.data, err);
        }
      };
      this.ws.onclose = () => {
        this.ws = null;
        this.scheduleReconnect();
      };
      this.ws.onerror = () => {
        this.ws = null;
      };
    } catch {
      // Sin sesión o error: no abrir WS
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout != null) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    console.log('[Realtime] Reconexión en', delay, 'ms (intento', this.reconnectAttempts, ')');
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimeout != null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Evitar reconexión tras logout
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
