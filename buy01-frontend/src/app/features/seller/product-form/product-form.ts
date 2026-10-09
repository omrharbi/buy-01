import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, last, map, of, switchMap } from 'rxjs';

import { MediaApi } from '../../../core/api/media.api';
import { ProductApi } from '../../../core/api/product.api';
import { FailedRequest } from '../../../core/models/api-error.model';
import { ProductInput } from '../../../core/models/product.model';
import { ToastService } from '../../../core/notify/toast.service';
import { positivePrice, wholeQuantity } from '../../../shared/validators/price.validator';
import { Alert } from '../../../ui/alert/alert';
import { Button } from '../../../ui/button/button';
import { FormField } from '../../../ui/form-field/form-field';
import { ImageUploader } from '../../../ui/image-uploader/image-uploader';

@Component({
  selector: 'app-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Alert, Button, FormField, ImageUploader],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit {
  private readonly api = inject(ProductApi);
  private readonly media = inject(MediaApi);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly id = input<string | undefined>(undefined);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly failure = signal<FailedRequest | null>(null);
  protected readonly imageUrls = signal<string[]>([]);
  /** Picked files that are uploaded after the product is saved, with its id. */
  private readonly pendingFiles = signal<File[]>([]);

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

  protected onPendingChanged(files: File[]): void {
    this.pendingFiles.set(files);
  }

  protected submit(): void {
    if (this.saving()) {
      return;
    }
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

    // The product is saved first; its images follow, each sent with the new product id.
    // The Media service then tells the Product service (over Kafka) to attach the URL.
    request
      .pipe(
        switchMap((product) =>
          this.uploadPending(product.id).pipe(
            map(() => ({ product, imagesFailed: false })),
            catchError(() => of({ product, imagesFailed: true })),
          ),
        ),
      )
      .subscribe({
        next: ({ product, imagesFailed }) => {
          this.saving.set(false);
          if (imagesFailed) {
            this.toasts.danger(
              `"${product.name}" was saved, but some images didn't upload. Try adding them again.`,
            );
            void this.router.navigateByUrl(`/seller/products/${product.id}/edit`);
            return;
          }
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

  private uploadPending(productId: string): Observable<void> {
    const files = this.pendingFiles();
    if (!files.length) {
      return of(undefined);
    }
    return forkJoin(files.map((file) => this.media.upload(file, productId).pipe(last()))).pipe(
      map(() => undefined),
    );
  }

  protected fieldError(name: string): string | null {
    return this.failure()?.fields?.[name] ?? null;
  }
}
