import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon } from '../icon/icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * The one action control. A loading button keeps its width and swaps its label for the
 * present-tense verb the caller passes, so a row never jumps mid-request.
 */
@Component({
  selector: 'ui-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <button
      [type]="type()"
      [class]="'btn btn--' + variant() + ' btn--' + size()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() ? true : null">
      @if (loading()) {
        <span class="spin" aria-hidden="true"></span>
        <span>{{ loadingLabel() }}</span>
      } @else {
        @if (icon(); as name) {
          <ui-icon [name]="name" [size]="size() === 'sm' ? 14 : 16" />
        }
        <ng-content />
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        width: 100%;
        font-family: var(--font-sans);
        font-size: 15px;
        line-height: 20px;
        font-weight: 600;
        padding: 10px var(--space-4);
        min-height: 40px;
        border-radius: var(--radius-md);
        border: 1px solid transparent;
        cursor: pointer;
        white-space: nowrap;
      }

      .btn--sm {
        font-size: 13px;
        line-height: 16px;
        font-weight: 500;
        letter-spacing: 0.01em;
        padding: 8px var(--space-3);
        min-height: 32px;
      }

      .btn--lg {
        padding: 14px var(--space-5);
        min-height: 48px;
      }

      .btn--primary {
        background: var(--brand);
        color: var(--on-brand);
      }

      .btn--primary:hover:not(:disabled) {
        background: var(--brand-hover);
      }

      .btn--secondary {
        background: var(--surface-100);
        color: var(--ink);
        border-color: var(--border-strong);
      }

      .btn--secondary:hover:not(:disabled) {
        background: var(--surface-200);
      }

      .btn--ghost {
        background: transparent;
        color: var(--brand);
      }

      .btn--ghost:hover:not(:disabled) {
        background: var(--brand-subtle);
      }

      .btn--danger {
        background: var(--danger);
        color: var(--surface-100);
      }

      :host-context([data-theme='dark']) .btn--danger {
        color: var(--surface-000);
      }

      .btn:disabled {
        background: var(--surface-200);
        color: var(--ink-muted);
        border-color: var(--border-subtle);
        cursor: not-allowed;
      }

      .spin {
        width: 14px;
        height: 14px;
        border-radius: var(--radius-full);
        border: 2px solid currentColor;
        border-top-color: transparent;
        animation: spin 0.7s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .spin {
          animation-duration: 2s;
        }
      }
    `,
  ],
})
export class Button {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly loadingLabel = input('Working…');
  readonly icon = input<string | null>(null);
}
