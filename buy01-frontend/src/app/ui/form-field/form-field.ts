import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { EMPTY, switchMap } from 'rxjs';

import { Icon } from '../icon/icon';
import { firstErrorMessage } from './field-errors';

/**
 * Label, control and one message row. The row is always rendered, even empty, so nothing
 * shifts when an error appears.
 *
 * The error shows only once the control is dirty or touched: a person should not be told they
 * are wrong before they have typed. A `serverError` — a 400 that named this field — shows
 * straight away, because they already submitted.
 */
@Component({
  selector: 'ui-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="field">
      <label class="label" [attr.for]="fieldId()">{{ label() }}</label>
      <ng-content />
      <p class="message" [id]="fieldId() + '-message'" [class.is-error]="!!message()">
        @if (message(); as text) {
          <ui-icon name="x-circle-fill" [size]="14" />
          <span>{{ text }}</span>
        } @else {
          <span>{{ hint() }}</span>
        }
      </p>
    </div>
  `,
  styles: [
    `
      .field {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }

      .label {
        font-size: 13px;
        line-height: 16px;
        font-weight: 500;
        letter-spacing: 0.01em;
        color: var(--ink);
      }

      .message {
        margin: 0;
        min-height: 16px;
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: 12px;
        line-height: 16px;
        color: var(--ink-muted);
      }

      .message.is-error {
        color: var(--danger);
      }
    `,
  ],
})
export class FormField {
  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly hint = input('');
  readonly control = input<AbstractControl | null>(null);
  /** A per-field message the API returned with a 400. */
  readonly serverError = input<string | null>(null);

  /** Re-evaluates whenever the control's value or touched state changes. */
  private readonly controlEvents = toSignal(
    toObservable(this.control).pipe(switchMap((control) => control?.events ?? EMPTY)),
  );

  readonly message = computed(() => {
    if (this.serverError()) {
      return this.serverError();
    }
    this.controlEvents();
    const control = this.control();
    if (!control || control.valid || (!control.dirty && !control.touched)) {
      return null;
    }
    return firstErrorMessage(control.errors, this.label());
  });
}
