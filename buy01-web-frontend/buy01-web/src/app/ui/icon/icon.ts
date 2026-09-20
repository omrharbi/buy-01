import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * One Bootstrap Icon from the design system's sprite. The sprite's symbols keep
 * `fill="currentColor"`, so an icon takes the colour of the text around it — which is how a
 * status icon ends up `danger` and a button icon ends up `on-brand`.
 *
 * Decorative by default: pass a `label` only when the icon carries meaning on its own.
 */
@Component({
  selector: 'ui-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.aria-hidden]="label() ? null : true"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label()"
      focusable="false">
      <use [attr.href]="'assets/design-system/icons/sprite.svg#' + name()"></use>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: none;
        line-height: 0;
      }
    `,
  ],
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(16);
  readonly label = input<string | null>(null);
}
