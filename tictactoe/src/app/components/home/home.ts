import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RealtimeService } from '../../services/realtime.service';
import { ToastService } from '../../services/toast.service';
import type { RealtimeEvent } from '../../services/realtime.service';
import { ToastComponent } from '../toast/toast';

const TOAST_DEBOUNCE_MS = 4000;

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ToastComponent],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private realtime = inject(RealtimeService);
  private toast = inject(ToastService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private eventsSub?: Subscription;
  private userSub?: Subscription;
  private lastToastKey = new Map<string, number>();

  user: { id: number; username: string; email: string } | null = null;

  ngOnInit(): void {
    this.realtime.connect();
    this.userSub = this.authService.currentUser$.subscribe((u) => {
      this.user = u;
      this.cdr.markForCheck();
    });
    this.eventsSub = this.realtime.events$.subscribe((ev) => {
      this.ngZone.run(() => this.handleRealtimeEvent(ev));
    });
  }

  ngOnDestroy(): void {
    this.eventsSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  private shouldShowToast(key: string): boolean {
    const now = Date.now();
    const last = this.lastToastKey.get(key);
    if (last != null && now - last < TOAST_DEBOUNCE_MS) return false;
    this.lastToastKey.set(key, now);
    return true;
  }

  private handleRealtimeEvent(ev: RealtimeEvent): void {
    switch (ev.event) {
      case 'friend_request': {
        const key = `friend_request-${ev.data.senderId}`;
        if (!this.shouldShowToast(key)) break;
        this.toast.info(`${ev.data.senderName} quiere ser tu amigo`);
        break;
      }
      case 'friend_accepted': {
        const key = `friend_accepted-${ev.data.userId}`;
        if (!this.shouldShowToast(key)) break;
        this.toast.success(`${ev.data.username} ha aceptado tu solicitud de amistad`);
        break;
      }
      case 'friend_rejected': {
        const key = `friend_rejected-${ev.data.userId}`;
        if (!this.shouldShowToast(key)) break;
        this.toast.info(`${ev.data.username} ha rechazado tu solicitud de amistad`);
        break;
      }
      case 'friend_removed': {
        const key = `friend_removed-${ev.data.userId}`;
        if (!this.shouldShowToast(key)) break;
        this.toast.info('Te han eliminado de la lista de amigos');
        break;
      }
      case 'game_invitation': {
        const key = `game_invitation-${ev.data.senderId}`;
        if (!this.shouldShowToast(key)) break;
        this.toast.info(`${ev.data.senderName} te invita a jugar`);
        break;
      }
      case 'game_invitation_accepted': {
        const key = `game_invitation_accepted-${ev.data.gameId}`;
        if (!this.shouldShowToast(key)) break;
        this.toast.success(`${ev.data.opponentUsername} ha aceptado tu invitación a jugar`);
        break;
      }
      case 'game_move': {
        const key = `game_move-${ev.data.gameId}`;
        if (!this.shouldShowToast(key)) break;
        this.toast.info(`Es tu turno: ${ev.data.opponentUsername} ha jugado`);
        break;
      }
    }
  }
}
