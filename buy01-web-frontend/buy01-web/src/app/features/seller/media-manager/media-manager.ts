import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MediaApi } from '../../../core/api/media.api';
import { FailedRequest } from '../../../core/models/api-error.model';
import { MediaRef } from '../../../core/models/media.model';
import { ToastService } from '../../../core/notify/toast.service';
import { formatBytes } from '../../../shared/validators/image-file.validator';
import { Button } from '../../../ui/button/button';
import { EmptyState } from '../../../ui/empty-state/empty-state';
import { Icon } from '../../../ui/icon/icon';
import { ImageUploader } from '../../../ui/image-uploader/image-uploader';

/**
 * The seller's image library — everything they have uploaded, whether or not a product links
 * to it. This is where the orphans from an abandoned product form show up.
 */
@Component({
  selector: 'app-media-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, EmptyState, Icon, ImageUploader],
  templateUrl: './media-manager.html',
  styleUrl: './media-manager.css',
})
export class MediaManager implements OnInit {
  private readonly api = inject(MediaApi);
  private readonly toasts = inject(ToastService);

  protected readonly items = signal<MediaRef[]>([]);
  protected readonly loading = signal(true);
  protected readonly pendingDelete = signal<MediaRef | null>(null);
  protected readonly deleting = signal(false);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.api.mine().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** The uploader posts straight to the service; reload so the grid shows what landed. */
  protected onUploaded(): void {
    this.load();
  }

  protected askDelete(item: MediaRef): void {
    this.pendingDelete.set(item);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected confirmDelete(): void {
    const item = this.pendingDelete();
    if (!item) {
      return;
    }
    this.deleting.set(true);

    this.api.remove(item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((candidate) => candidate.id !== item.id));
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.toasts.success(`${item.fileName} was deleted.`);
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

  protected readable(size: number): string {
    return formatBytes(size);
  }
}
