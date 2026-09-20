import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product } from '../../core/models/product.model';
import { Icon } from '../icon/icon';

/**
 * The unit of the public catalog: one image, a title, its seller, a price. The whole card is
 * the link, so there is no button inside a clickable card.
 */
@Component({
  selector: 'ui-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink],
  template: `
    <article class="card">
      <a class="link" [routerLink]="['/products', product().id]">
        <span class="well">
          @if (product().imageUrls.length) {
            <img [src]="product().imageUrls[0]" [alt]="product().name" loading="lazy" />
          } @else {
            <span class="fallback">
              <ui-icon name="image" [size]="34" />
              <span class="caption">No image yet</span>
            </span>
          }
          @if (product().quantity === 0) {
            <span class="flag">Out of stock</span>
          }
        </span>

        <span class="body">
          <span class="title">{{ product().name }}</span>
          <span class="seller">{{ product().sellerName }}</span>
          <span class="foot">
            <span class="price">{{ product().price.toFixed(2) }} MAD</span>
            <span class="caption">{{ product().imageUrls.length }} images</span>
          </span>
        </span>
      </a>
    </article>
  `,
  styles: [
    `
      .card {
        background: var(--surface-100);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        height: 100%;
      }

      .card:hover {
        box-shadow: var(--shadow-md);
      }

      .link {
        display: flex;
        flex-direction: column;
        height: 100%;
        text-decoration: none;
        color: inherit;
      }

      .well {
        position: relative;
        aspect-ratio: 4 / 3;
        background: var(--surface-200);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .fallback {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-2);
        color: var(--ink-muted);
      }

      .flag {
        position: absolute;
        top: var(--space-2);
        left: var(--space-2);
        background: var(--surface-inverse);
        color: var(--ink-inverse);
        border-radius: var(--radius-sm);
        font-size: 12px;
        line-height: 16px;
        font-weight: 500;
        padding: 2px var(--space-2);
      }

      .body {
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        flex: 1;
      }

      .title {
        font-size: 15px;
        line-height: 20px;
        font-weight: 600;
        color: var(--ink);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .seller {
        font-size: 13px;
        line-height: 20px;
        color: var(--ink-muted);
      }

      .foot {
        margin-top: auto;
        padding-top: var(--space-2);
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-2);
      }

      .price {
        font-family: var(--font-display);
        font-size: 17px;
        line-height: 22px;
        font-weight: 700;
        color: var(--accent);
      }

      .caption {
        font-size: 12px;
        line-height: 16px;
        color: var(--ink-muted);
      }
    `,
  ],
})
export class ProductCard {
  readonly product = input.required<Product>();
}
