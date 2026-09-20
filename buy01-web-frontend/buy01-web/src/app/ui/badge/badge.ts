import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Icon } from '../icon/icon';

export type BadgeVariant =
  | 'role-seller'
  | 'role-client'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'price';

/**
 * A small fact about the thing beside it. Every status variant carries an icon as well as a
 * colour, so the difference between published and failed survives greyscale.
 */
@Component({
  selector: 'ui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <span [class]="'badge badge--' + variant()">
      @if (resolvedIcon(); as name) {
        <ui-icon [name]="name" [size]="12" />
      }
      <ng-content />
    </span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-1);
        font-size: 13px;
        line-height: 16px;
        font-weight: 500;
        letter-spacing: 0.01em;
        padding: 4px var(--space-2);
        border-radius: var(--radius-sm);
      }

      .badge--role-seller {
        background: var(--brand-subtle);
        color: var(--brand);
        border-radius: var(--radius-full);
        padding: 4px var(--space-3);
      }

      .badge--role-client {
        background: var(--surface-200);
        color: var(--ink-muted);
        border-radius: var(--radius-full);
        padding: 4px var(--space-3);
      }

      .badge--neutral {
        background: var(--surface-200);
        color: var(--ink-muted);
      }

      .badge--success {
        background: var(--success-subtle);
        color: var(--success);
      }

      .badge--warning {
        background: var(--warning-subtle);
        color: var(--warning);
      }

      .badge--danger {
        background: var(--danger-subtle);
        color: var(--danger);
      }

      .badge--info {
        background: var(--info-subtle);
        color: var(--info);
      }

      .badge--price {
        background: var(--accent-subtle);
        color: var(--accent);
        font-family: var(--font-display);
        font-weight: 700;
      }
    `,
  ],
})
export class Badge {
  readonly variant = input<BadgeVariant>('neutral');
  readonly icon = input<string | null>(null);

  /** Status variants get their icon for free; the caller can still override it. */
  protected readonly resolvedIcon = computed(() => {
    if (this.icon()) {
      return this.icon();
    }
    switch (this.variant()) {
      case 'success':
        return 'check-circle-fill';
      case 'warning':
        return 'exclamation-triangle-fill';
      case 'danger':
        return 'x-circle-fill';
      case 'info':
        return 'info-circle-fill';
      case 'role-seller':
        return 'shop';
      case 'role-client':
        return 'cart3';
      default:
        return null;
    }
  });
}
