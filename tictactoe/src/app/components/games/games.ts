import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GamesService } from '../../services/games.service';
import { RealtimeService } from '../../services/realtime.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-games',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './games.html',
})
export class GamesComponent implements OnInit, OnDestroy {
  private gamesService = inject(GamesService);
  private realtime = inject(RealtimeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private eventsSub?: Subscription;

  games: any[] = [];
  invitations: any[] = [];
  targetUsername = '';
  message = '';
  error = '';
  activeTab: 'games' | 'requests' | 'invite' = 'games';

  get pendingGames(): any[] {
    return this.games.filter((g) => g.status === 'ACTIVE' && g.playerTurn === g.mySymbol);
  }

  get otherGames(): any[] {
    return this.games.filter((g) => !(g.status === 'ACTIVE' && g.playerTurn === g.mySymbol));
  }

  ngOnInit() {
    this.loadGames();
    this.loadInvitations();
    this.realtime.connect();
    this.eventsSub = this.realtime.events$.subscribe((ev) => {
      this.ngZone.run(() => {
        if (ev.event === 'game_move') {
          this.loadGames();
          this.cdr.detectChanges();
        }
        if (ev.event === 'game_invitation') {
          this.loadInvitations();
          this.cdr.detectChanges();
        }
        if (ev.event === 'game_invitation_accepted') {
          this.loadGames();
          this.cdr.detectChanges();
        }
      });
    });
  }

  ngOnDestroy() {
    this.eventsSub?.unsubscribe();
  }

  loadGames() {
    this.gamesService.getGames().subscribe({
      next: (res) => {
        this.games = res.games ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading games:', err),
    });
  }

  loadInvitations() {
    this.gamesService.getInvitations().subscribe({
      next: (res) => {
        this.invitations = res.invitations ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading invitations:', err),
    });
  }

  setActiveTab(tab: 'games' | 'requests' | 'invite') {
    this.activeTab = tab;
    this.message = '';
    this.error = '';
    if (tab === 'games') this.loadGames();
    if (tab === 'requests') this.loadInvitations();
  }

  sendInvite() {
    this.message = '';
    this.error = '';
    this.gamesService.sendInvite(this.targetUsername).subscribe({
      next: () => {
        this.message = 'Invitación enviada';
        this.targetUsername = '';
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al enviar invitación';
      },
    });
  }

  acceptInvitation(id: number) {
    this.gamesService.acceptInvitation(id).subscribe({
      next: () => {
        this.loadInvitations();
        this.loadGames();
      },
      error: (err) => console.error(err),
    });
  }

  rejectInvitation(id: number) {
    this.gamesService.rejectInvitation(id).subscribe({
      next: () => this.loadInvitations(),
      error: (err) => console.error(err),
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'En curso',
      FINISHED: 'Finalizada',
      DRAW: 'Empate',
    };
    return labels[status] || status;
  }
}
