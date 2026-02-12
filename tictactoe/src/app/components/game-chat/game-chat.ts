import { Component, inject, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GamesService } from '../../services/games.service';
import { RealtimeService } from '../../services/realtime.service';

@Component({
  selector: 'app-game-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-chat.html',
  styles: [`
    .chat-panel-deploy {
      transform-origin: bottom right;
      animation: chatDeploy 0.3s ease-out forwards;
    }
    @keyframes chatDeploy {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `],
})
export class GameChatComponent implements OnInit, OnDestroy {
  private gamesService = inject(GamesService);
  private realtime = inject(RealtimeService);
  private cdr = inject(ChangeDetectorRef);
  private eventsSub?: Subscription;

  @Input() gameId!: number;
  @Input() opponentUsername = '';
  @Input() onClose!: () => void;

  expanded = false;
  messages: { id: number; content: string; createdAt: string; senderUsername: string; isMine: boolean }[] = [];
  newMessage = '';
  loading = true;
  sending = false;
  error = '';

  ngOnInit() {
    this.loadChat();
    this.eventsSub = this.realtime.events$.subscribe((ev) => {
      if (ev.event === 'chat_message' && ev.data.gameId === this.gameId) {
        const msg = ev.data.message;
        if (!this.messages.some((m) => m.id === msg.id)) {
          this.messages = [...this.messages, msg];
          this.cdr.detectChanges();
          this.scrollToBottom();
        }
      }
    });
  }

  ngOnDestroy() {
    this.eventsSub?.unsubscribe();
  }

  loadChat() {
    this.loading = true;
    this.error = '';
    this.gamesService.getGameChat(this.gameId).subscribe({
      next: (res) => {
        this.messages = res.messages ?? [];
        this.opponentUsername = res.opponentUsername ?? this.opponentUsername;
        this.loading = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al cargar chat';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  send() {
    const content = this.newMessage?.trim();
    if (!content || this.sending) return;
    this.sending = true;
    this.gamesService.sendChatMessage(this.gameId, content).subscribe({
      next: () => {
        this.newMessage = '';
        this.sending = false;
        this.cdr.detectChanges();
        // El mensaje se añade por WebSocket (chat_message) en tiempo real
        this.scrollToBottom();
      },
      error: () => {
        this.sending = false;
        this.cdr.detectChanges();
      },
    });
  }

  openPanel() {
    this.expanded = true;
  }

  close() {
    this.onClose();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = document.getElementById('game-chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
