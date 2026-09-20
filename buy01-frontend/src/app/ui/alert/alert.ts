import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Icon } from '../icon/icon';

export type AlertVariant = 'success' | 'info' | 'warning' | 'danger';

/**
 * The inline message block, for a failure the person is still looking at. The title and body
 * stay `ink` so they hold contrast on every tinted ground; the variant colours the icon.
 */
@Component({
  selector: 'ui-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div [class]="'alert alert--' + variant()" [attr.role]="liveRole()">
      <ui-icon [name]="icon()" [size]="18" />
      <div class="content">
        <p class="title">{{ title() }}</p>
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .alert {
        display: flex;
        gap: var(--space-3);
        padding: var(--space-4);
        border-radius: var(--radius-md);
      }

      ui-icon {
        margin-top: 2px;
      }

      .content {
        min-width: 0;
      }

      .title {
        margin: 0;
        font-size: 15px;
        line-height: 20px;
        font-weight: 600;
        color: var(--ink);
      }

      .content ::ng-deep p {
        margin: var(--space-1) 0 0;
        font-size: 13px;
        line-height: 20px;
        color: var(--ink);
      }

      .alert--success {
        background: var(--success-subtle);
        color: var(--success);
      }

      .alert--info {
        background: var(--info-subtle);
        color: var(--info);
      }

      .alert--warning {
        background: var(--warning-subtle);
        color: var(--warning);
      }

      .alert--danger {
        background: var(--danger-subtle);
        color: var(--danger);
      }
    `,
  ],
})
export class Alert {
  readonly variant = input<AlertVariant>('info');
  readonly title = input.required<string>();

  protected readonly icon = computed(() => {
    switch (this.variant()) {
      case 'success':
        return 'check-circle-fill';
      case 'warning':
        return 'exclamation-triangle-fill';
      case 'danger':
        return 'x-circle-fill';
      default:
        return 'info-circle-fill';
    }
  });

  /** Warnings and failures interrupt; the other two are announced politely. */
  protected readonly liveRole = computed(() =>
    this.variant() === 'danger' || this.variant() === 'warning' ? 'alert' : 'status',
  );
}
