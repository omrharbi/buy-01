import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { ProductApi } from '../../../core/api/product.api';
import { Product } from '../../../core/models/product.model';
import { EmptyState } from '../../../ui/empty-state/empty-state';
import { ProductCard } from '../../../ui/product-card/product-card';

/**
 * The public catalog. No search and no filters — the subject does not ask for them, and an
 * empty toolbar reads as a broken feature.
 */
@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCard, EmptyState],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private readonly api = inject(ProductApi);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly skeletons = [0, 1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.api.list().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
