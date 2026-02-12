import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const AUTO_DISMISS_MS = 4000;

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<Toast[]>([]);
  private dismissTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = 'info'): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = { id, message, type };
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, toast]);

    const timeout = setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
    this.dismissTimeouts.set(id, timeout);

    return id;
  }

  success(message: string): string {
    return this.show(message, 'success');
  }

  error(message: string): string {
    return this.show(message, 'error');
  }

  info(message: string): string {
    return this.show(message, 'info');
  }

  dismiss(id: string): void {
    const timeout = this.dismissTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.dismissTimeouts.delete(id);
    }
    const current = this.toastsSubject.value.filter((t) => t.id !== id);
    this.toastsSubject.next(current);
  }
}
