import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GamesService } from '../../services/games.service';
import { RealtimeService } from '../../services/realtime.service';
import { GameChatComponent } from '../game-chat/game-chat';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-play',
  imports: [CommonModule, RouterModule, GameChatComponent],
  templateUrl: './game-play.html',
})
export class GamePlayComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gamesService = inject(GamesService);
  private realtime = inject(RealtimeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private eventsSub?: Subscription;

  gameId: number | null = null;
  game: {
    id: number;
    boardState: string;
    playerTurn: string;
    status: string;
    winnerId: number | null;
    mySymbol: string;
    opponentUsername: string;
    youWon?: boolean;
  } | null = null;
  error = '';
  makingMove = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.gameId = id ? +id : null;
    if (this.gameId) {
      this.loadGame();
      this.realtime.connect();
      this.eventsSub = this.realtime.events$.subscribe((ev) => {
        this.ngZone.run(() => {
          if (ev.event === 'game_move' && ev.data.gameId === this.gameId) {
            this.loadGame();
            this.cdr.detectChanges();
          }
        });
      });
    } else {
      this.error = 'Partida no válida';
    }
  }

  ngOnDestroy() {
    this.eventsSub?.unsubscribe();
  }

  loadGame() {
    if (!this.gameId) return;
    this.gamesService.getGame(this.gameId).subscribe({
      next: (res) => {
        this.game = res.game;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al cargar partida';
        this.cdr.detectChanges();
      },
    });
  }

  cellValue(index: number): string {
    if (!this.game) return '';
    const c = this.game.boardState[index];
    return c === '-' ? '' : c;
  }

  canPlay(index: number): boolean {
    return !!(
      this.game &&
      this.game.status === 'ACTIVE' &&
      this.game.playerTurn === this.game.mySymbol &&
      this.game.boardState[index] === '-' &&
      !this.makingMove
    );
  }

  play(index: number) {
    if (!this.gameId || !this.canPlay(index)) return;
    this.makingMove = true;
    this.gamesService.makeMove(this.gameId, index).subscribe({
      next: (res) => {
        this.game = res.game;
        this.makingMove = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al jugar';
        this.makingMove = false;
        this.cdr.detectChanges();
      },
    });
  }

  back() {
    this.router.navigate(['/home/games']);
  }

  closeChat = (): void => {};

  statusMessage(): string {
    if (!this.game) return '';
    if (this.game.status === 'FINISHED') {
      if (this.game.youWon) return '¡Has ganado!';
      if (this.game.winnerId) return 'Has perdido';
      return '';
    }
    if (this.game.status === 'DRAW') return 'Empate';
    return this.game.playerTurn === this.game.mySymbol ? 'Tu turno' : 'Turno de ' + this.game.opponentUsername;
  }
}
