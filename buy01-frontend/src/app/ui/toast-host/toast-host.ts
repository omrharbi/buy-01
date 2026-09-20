import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '../../core/notify/toast.service';
import { Icon } from '../icon/icon';

/** The corner stack. Mounted once, in the shell. */
@Component({
  selector: 'ui-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="stack">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="toast" [attr.role]="toast.kind === 'danger' ? 'alert' : 'status'">
          <ui-icon [name]="iconFor(toast.kind)" [size]="16" />
          <span class="text">{{ toast.message }}</span>
          <button class="close" type="button" (click)="toasts.dismiss(toast.id)">
            <ui-icon name="x-lg" [size]="12" label="Dismiss" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .stack {
        position: fixed;
        right: var(--space-4);
        bottom: var(--space-4);
        z-index: 50;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        max-width: min(420px, calc(100vw - 32px));
      }

      .toast {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        background: var(--surface-inverse);
        color: var(--ink-inverse);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        padding: var(--space-3) var(--space-4);
        font-size: 13px;
        line-height: 20px;
      }

      .text {
        flex: 1;
      }

      .close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--ink-inverse);
        padding: 4px;
        display: grid;
        place-items: center;
      }

      /* focus-ring is tuned for the light-side surfaces; on the inverse ground the ring is ink. */
      .close:focus-visible {
        outline: 2px solid var(--ink-inverse);
        outline-offset: 2px;
      }
    `,
  ],
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);

  protected iconFor(kind: string): string {
    if (kind === 'success') {
      return 'check-circle-fill';
    }
    return kind === 'danger' ? 'x-circle-fill' : 'info-circle-fill';
  }
}
