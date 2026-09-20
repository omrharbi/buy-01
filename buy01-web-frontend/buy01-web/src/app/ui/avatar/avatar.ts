import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * A seller's face: the photo when there is one, their initials when there is not. Never a
 * generic silhouette, and never a colour hashed from the name.
 */
@Component({
  selector: 'ui-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="'av av--' + size()" [attr.aria-hidden]="decorative() ? true : null">
      @if (src(); as photo) {
        <img [src]="photo" [alt]="decorative() ? '' : name()" />
      } @else {
        <span>{{ initials() }}</span>
      }
    </span>
  `,
  styles: [
    `
      .av {
        display: inline-grid;
        place-items: center;
        overflow: hidden;
        flex: none;
        border-radius: var(--radius-full);
        background: var(--brand-subtle);
        color: var(--brand);
        font-family: var(--font-display);
        font-weight: 700;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .av--xs {
        width: 24px;
        height: 24px;
        font-size: 10px;
      }

      .av--sm {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      .av--md {
        width: 40px;
        height: 40px;
        font-size: 14px;
      }

      .av--lg {
        width: 64px;
        height: 64px;
        font-size: 20px;
      }
    `,
  ],
})
export class Avatar {
  readonly name = input('');
  readonly src = input<string | null>(null);
  readonly size = input<AvatarSize>('md');
  /** True when the name is already written next to it, so a reader does not hear it twice. */
  readonly decorative = input(false);

  protected readonly initials = computed(() =>
    this.name()
      .split(/[\s\-_.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('') || '?',
  );
}
