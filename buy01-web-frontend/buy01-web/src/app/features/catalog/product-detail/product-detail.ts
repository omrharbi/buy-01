import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductApi } from '../../../core/api/product.api';
import { AuthService } from '../../../core/auth/auth.service';
import { FailedRequest } from '../../../core/models/api-error.model';
import { Product } from '../../../core/models/product.model';
import { Avatar } from '../../../ui/avatar/avatar';
import { Badge } from '../../../ui/badge/badge';
import { Button } from '../../../ui/button/button';
import { EmptyState } from '../../../ui/empty-state/empty-state';
import { Icon } from '../../../ui/icon/icon';

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Avatar, Badge, Button, EmptyState, Icon],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private readonly api = inject(ProductApi);
  private readonly auth = inject(AuthService);

  /** Bound from the route by withComponentInputBinding(). */
  readonly id = input.required<string>();

  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);
  protected readonly missing = signal(false);
  protected readonly active = signal(0);

  ngOnInit(): void {
    this.api.byId(this.id()).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (failure: FailedRequest) => {
        this.loading.set(false);
        this.missing.set(failure.status === 404);
      },
    });
  }

  /** True when the viewer is the seller who owns this product. */
  protected get isOwner(): boolean {
    return this.product()?.sellerId === this.auth.user()?.id;
  }
}
