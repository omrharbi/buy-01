import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon } from '../icon/icon';

/**
 * The full-area message for a space with nothing in it — including the spaces that are empty
 * because of who you are. Neutral tokens only: empty is not an error, the forbidden page
 * included.
 */
@Component({
  selector: 'ui-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <section class="es">
      <ui-icon [name]="icon()" [size]="34" />
      <h3 class="title">{{ title() }}</h3>
      <p class="body">{{ body() }}</p>
      <div class="action">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      .es {
        background: var(--surface-100);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-12) var(--space-5);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-3);
        color: var(--ink-muted);
      }

      .title {
        margin: 0;
        font-family: var(--font-display);
        font-size: 26px;
        line-height: 32px;
        font-weight: 500;
        color: var(--ink);
      }

      .body {
        margin: 0;
        font-size: 15px;
        line-height: 23px;
        color: var(--ink-muted);
        max-width: 42ch;
      }

      .action:empty {
        display: none;
      }

      .action {
        margin-top: var(--space-2);
      }
    `,
  ],
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly title = input.required<string>();
  readonly body = input('');
}
