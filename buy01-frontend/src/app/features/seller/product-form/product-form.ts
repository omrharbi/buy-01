import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ProductApi } from '../../../core/api/product.api';
import { FailedRequest } from '../../../core/models/api-error.model';
import { ProductInput } from '../../../core/models/product.model';
import { ToastService } from '../../../core/notify/toast.service';
import { positivePrice, wholeQuantity } from '../../../shared/validators/price.validator';
import { Alert } from '../../../ui/alert/alert';
import { Button } from '../../../ui/button/button';
import { FormField } from '../../../ui/form-field/form-field';
import { ImageUploader } from '../../../ui/image-uploader/image-uploader';

/**
 * Create and edit in one component: the fields are the same, and so are the rules. The route
 * decides which — `/seller/products/new` has no id, `/seller/products/:id/edit` does.
 */
@Component({
  selector: 'app-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Alert, Button, FormField, ImageUploader],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit {
  private readonly api = inject(ProductApi);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  /** Present only on the edit route. */
  readonly id = input<string | undefined>(undefined);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly failure = signal<FailedRequest | null>(null);
  protected readonly imageUrls = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(2000)]],
    price: [null as number | null, [Validators.required, positivePrice()]],
    quantity: [0, [Validators.required, wholeQuantity()]],
  });

  protected get editing(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      return;
    }
    this.loading.set(true);
    this.api.byId(id).subscribe({
      next: (product) => {
        this.form.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
        });
        this.imageUrls.set(product.imageUrls);
        this.loading.set(false);
      },
      error: (failure: FailedRequest) => {
        this.loading.set(false);
        this.failure.set(failure);
      },
    });
  }

  protected onImagesChanged(urls: string[]): void {
    this.imageUrls.set(urls);
  }

  protected submit(): void {
    this.failure.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const input: ProductInput = {
      name: value.name.trim(),
      description: value.description.trim(),
      price: Number(value.price),
      quantity: Number(value.quantity),
      imageUrls: this.imageUrls(),
    };

    this.saving.set(true);
    const request = this.editing ? this.api.update(this.id()!, input) : this.api.create(input);

    request.subscribe({
      next: (product) => {
        this.saving.set(false);
        this.toasts.success(
          this.editing ? `"${product.name}" was updated.` : `"${product.name}" is live in the catalog.`,
        );
        void this.router.navigateByUrl('/seller/dashboard');
      },
      error: (failure: FailedRequest) => {
        this.saving.set(false);
        this.failure.set(failure);
      },
    });
  }

  protected fieldError(name: string): string | null {
    return this.failure()?.fields?.[name] ?? null;
  }
}
