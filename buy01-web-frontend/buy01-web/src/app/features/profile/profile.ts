import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';
import { FailedRequest } from '../../core/models/api-error.model';
import { ToastService } from '../../core/notify/toast.service';
import { Avatar } from '../../ui/avatar/avatar';
import { Badge } from '../../ui/badge/badge';
import { Button } from '../../ui/button/button';
import { FormField } from '../../ui/form-field/form-field';
import { ImageUploader } from '../../ui/image-uploader/image-uploader';

/**
 * GET /me and PUT /me. Sellers can also set an avatar, which goes through the Media service
 * like any other image — one file, same 2 MB ceiling.
 */
@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Avatar, Badge, Button, FormField, ImageUploader],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly toasts = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly saving = signal(false);
  protected readonly failure = signal<FailedRequest | null>(null);
  protected readonly avatarUrl = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
  });

  ngOnInit(): void {
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({ name: user.name });
      this.avatarUrl.set(user.avatarUrl);
    }
    // The cached user can be stale; the server's copy is what the guards should follow.
    this.auth.refreshProfile().subscribe({
      next: (fresh) => {
        this.form.patchValue({ name: fresh.name });
        this.avatarUrl.set(fresh.avatarUrl);
      },
      error: () => undefined,
    });
  }

  protected onAvatarChanged(urls: string[]): void {
    this.avatarUrl.set(urls.length ? urls[urls.length - 1] : null);
  }

  protected submit(): void {
    this.failure.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    this.auth.updateProfile({ name: this.form.getRawValue().name.trim(), avatarUrl: this.avatarUrl() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toasts.success('Your profile was updated.');
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
