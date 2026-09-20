import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';

import { MediaApi } from '../../core/api/media.api';
import { MEDIA_RULES } from '../../core/config/api.config';
import { FailedRequest } from '../../core/models/api-error.model';
import { QueuedUpload } from '../../core/models/media.model';
import { formatBytes, validateImageFile } from '../../shared/validators/image-file.validator';
import { Alert } from '../alert/alert';
import { Icon } from '../icon/icon';

/**
 * The dropzone, the queue and the rejection list — the seller-only path into the Media
 * service. Every limit is stated before a file is picked and checked before a byte goes out;
 * the service checks all of it again.
 */
@Component({
  selector: 'ui-image-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Alert, Icon],
  templateUrl: './image-uploader.html',
  styleUrl: './image-uploader.css',
})
export class ImageUploader {
  private readonly media = inject(MediaApi);

  /** URLs already attached to the product being edited. */
  readonly existing = input<string[]>([]);
  readonly max = input<number>(MEDIA_RULES.maxFilesPerProduct);
  readonly label = input('Product images');

  /** The full, ordered list of attached image URLs, emitted on every change. */
  readonly changed = output<string[]>();

  protected readonly rules = MEDIA_RULES;
  protected readonly urls = signal<string[]>([]);
  protected readonly queue = signal<QueuedUpload[]>([]);
  protected readonly rejections = signal<string[]>([]);
  protected readonly dragging = signal(false);
  protected readonly uploadedThisSession = signal(false);

  constructor() {
    // Adopt the product's existing images when the form loads or switches product.
    effect(() => this.urls.set([...this.existing()]));
  }

  protected get remaining(): number {
    return this.max() - this.urls().length - this.queue().filter((item) => item.status === 'uploading').length;
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(): void {
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    void this.accept(event.dataTransfer?.files ?? null);
  }

  protected onPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    void this.accept(input.files);
    input.value = ''; // so picking the same file twice still fires a change
  }

  /**
   * Checks every file before queueing any of it. Failures are collected into one Alert —
   * never one toast per file.
   */
  private async accept(list: FileList | null): Promise<void> {
    if (!list?.length) {
      return;
    }
    const rejected: string[] = [];
    const accepted: File[] = [];

    for (const file of Array.from(list)) {
      if (accepted.length >= this.remaining) {
        rejected.push(`${file.name} wasn't added — that would be more than ${this.max()} images.`);
        continue;
      }
      const problem = await validateImageFile(file);
      if (problem) {
        rejected.push(problem);
      } else {
        accepted.push(file);
      }
    }

    this.rejections.set(rejected);
    accepted.forEach((file) => this.upload(file));
  }

  private upload(file: File): void {
    const item: QueuedUpload = {
      localId: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading',
      media: null,
      error: null,
    };
    this.queue.update((list) => [...list, item]);

    this.media.upload(file).subscribe({
      next: (event) => {
        if (event.type === 'progress') {
          this.patch(item.localId, { progress: event.value });
        } else {
          this.patch(item.localId, { status: 'done', progress: 100, media: event.media });
          this.urls.update((list) => [...list, event.media.url]);
          this.uploadedThisSession.set(true);
          this.emit();
        }
      },
      error: (failure: FailedRequest) => {
        this.patch(item.localId, { status: 'failed', error: failure.message });
      },
    });
  }

  private patch(localId: string, changes: Partial<QueuedUpload>): void {
    this.queue.update((list) =>
      list.map((item) => (item.localId === localId ? { ...item, ...changes } : item)),
    );
  }

  /** Unlinks an image from the product. The file itself stays in the seller's media library. */
  protected removeUrl(url: string): void {
    this.urls.update((list) => list.filter((candidate) => candidate !== url));
    this.queue.update((list) => {
      const dropped = list.filter((item) => item.media?.url === url);
      dropped.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return list.filter((item) => item.media?.url !== url);
    });
    this.emit();
  }

  protected dismissFailed(localId: string): void {
    this.queue.update((list) => {
      const item = list.find((candidate) => candidate.localId === localId);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return list.filter((candidate) => candidate.localId !== localId);
    });
  }

  protected clearRejections(): void {
    this.rejections.set([]);
  }

  protected readable(size: number): string {
    return formatBytes(size);
  }

  private emit(): void {
    this.changed.emit(this.urls());
  }
}
