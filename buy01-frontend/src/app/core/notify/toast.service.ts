import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'info' | 'danger';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

/**
 * The corner stack, for outcomes the person has already moved on from. Anything they are
 * still looking at belongs inline — a field message or an alert in the panel.
 *
 * At most three at once; a fourth waits, because a wall of failures helps no one read them.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private static readonly LIMIT = 3;
  private static readonly DISMISS_AFTER = 4000;

  private nextId = 1;
  private readonly items = signal<Toast[]>([]);

  readonly toasts = this.items.asReadonly();

  success(message: string): void {
    this.push('success', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  danger(message: string): void {
    this.push('danger', message);
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((toast) => toast.id !== id));
  }

  private push(kind: ToastKind, message: string): void {
    const toast: Toast = { id: this.nextId++, kind, message };
    this.items.update((list) => [...list, toast].slice(-ToastService.LIMIT));
    setTimeout(() => this.dismiss(toast.id), ToastService.DISMISS_AFTER);
  }
}
