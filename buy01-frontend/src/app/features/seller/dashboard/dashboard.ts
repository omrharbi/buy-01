import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductApi } from '../../../core/api/product.api';
import { AuthService } from '../../../core/auth/auth.service';
import { FailedRequest } from '../../../core/models/api-error.model';
import { Product } from '../../../core/models/product.model';
import { ToastService } from '../../../core/notify/toast.service';
import { Badge } from '../../../ui/badge/badge';
import { Button } from '../../../ui/button/button';
import { EmptyState } from '../../../ui/empty-state/empty-state';
import { Icon } from '../../../ui/icon/icon';

/**
 * The seller's catalog. The only place in the app where edit and delete live, and the only
 * place that lists products by owner.
 */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Badge, Button, EmptyState, Icon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly api = inject(ProductApi);
  private readonly toasts = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly pendingDelete = signal<Product | null>(null);
  protected readonly deleting = signal(false);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.api.mine().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected askDelete(product: Product): void {
    this.pendingDelete.set(product);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  /**
   * The row stays put until the service confirms. Removing it optimistically would be wrong
   * the moment a 403 comes back, and putting a row back is worse than never taking it away.
   */
  protected confirmDelete(): void {
    const product = this.pendingDelete();
    if (!product) {
      return;
    }
    this.deleting.set(true);

    this.api.remove(product.id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((candidate) => candidate.id !== product.id));
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toasts.success(`"${product.name}" was deleted.`);
      },
      error: (failure: FailedRequest) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        if (failure.status !== 403) {
          this.toasts.danger(failure.message);
        }
      },
    });
  }
}
