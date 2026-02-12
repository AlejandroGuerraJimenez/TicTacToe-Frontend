import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FriendsService } from '../../services/friends.service';
import { RealtimeService } from '../../services/realtime.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-friends',
  imports: [CommonModule, FormsModule],
  templateUrl: './friends.html',
})
export class FriendsComponent implements OnInit, OnDestroy {
  private friendsService = inject(FriendsService);
  private realtime = inject(RealtimeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private eventsSub?: Subscription;

  activeTab: 'friends' | 'requests' | 'add' = 'friends';
  friends: any[] = [];
  requests: any[] = [];
  targetUsername: string = '';
  message: string = '';
  error: string = '';

  ngOnInit() {
    this.loadFriends();
    this.loadRequests();
    this.realtime.connect();
    this.eventsSub = this.realtime.events$.subscribe((msg) => {
      this.ngZone.run(() => {
        console.log('[Friends] Evento realtime:', msg.event);
        if (msg.event === 'friend_request') this.loadRequests();
        if (msg.event === 'friend_accepted' || msg.event === 'friend_rejected') {
          this.loadRequests();
          this.loadFriends();
        }
        if (msg.event === 'friend_removed') this.loadFriends();
      });
    });
  }

  ngOnDestroy() {
    this.eventsSub?.unsubscribe();
  }

  loadFriends() {
    this.friendsService.getFriends().subscribe({
      next: (res) => {
        this.friends = res.friends ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading friends:', err);
      }
    });
  }

  loadRequests() {
    this.friendsService.getRequests().subscribe({
      next: (res) => {
        this.requests = res.requests ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  sendRequest() {
    this.message = '';
    this.error = '';
    this.friendsService.sendRequest(this.targetUsername).subscribe({
      next: (res) => {
        this.message = 'Solicitud enviada correctamente';
        this.targetUsername = '';
      },
      error: (err) => {
        this.error = err.error.error || 'Error al enviar solicitud';
      }
    });
  }

  acceptRequest(id: number) {
    this.friendsService.acceptRequest(id).subscribe({
      next: () => {
        this.loadRequests();
        this.loadFriends();
      },
      error: (err) => console.error(err)
    });
  }

  rejectRequest(id: number) {
    this.friendsService.rejectRequest(id).subscribe({
      next: () => this.loadRequests(),
      error: (err) => console.error(err)
    });
  }

  removeFriend(id: number) {
    this.message = '';
    this.error = '';
    if (confirm('¿Seguro que quieres eliminar a este amigo?')) {
      this.friendsService.removeFriend(id).subscribe({
        next: () => {
          this.message = 'Amigo eliminado correctamente.';
          this.loadFriends();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.error?.error || 'Error al eliminar el amigo.';
          this.loadFriends(); // refrescar lista por si el backend sí lo borró
        }
      });
    }
  }

  setActiveTab(tab: 'friends' | 'requests' | 'add') {
    this.activeTab = tab;
    this.message = '';
    this.error = '';

    // Recargar datos cuando cambias de tab
    if (tab === 'friends') {
      this.loadFriends();
    } else if (tab === 'requests') {
      this.loadRequests();
    }
  }
}
