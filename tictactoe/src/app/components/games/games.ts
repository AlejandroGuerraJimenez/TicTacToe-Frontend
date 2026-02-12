import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesService } from '../../services/games.service';

@Component({
  selector: 'app-games',
  imports: [CommonModule, FormsModule],
  templateUrl: './games.html',
})
export class GamesComponent implements OnInit {
  private gamesService = inject(GamesService);
  private cdr = inject(ChangeDetectorRef);

  games: any[] = [];
  invitations: any[] = [];
  targetUsername = '';
  message = '';
  error = '';
  activeTab: 'games' | 'requests' | 'invite' = 'games';

  ngOnInit() {
    this.loadGames();
    this.loadInvitations();
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
