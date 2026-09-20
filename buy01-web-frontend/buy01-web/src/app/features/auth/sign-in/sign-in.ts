import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { FailedRequest } from '../../../core/models/api-error.model';
import { Alert } from '../../../ui/alert/alert';
import { Button } from '../../../ui/button/button';
import { FormField } from '../../../ui/form-field/form-field';

@Component({
  selector: 'app-sign-in',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Alert, Button, FormField],
  templateUrl: './sign-in.html',
  styleUrl: '../auth.css',
})
export class SignIn {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly submitting = signal(false);
  protected readonly failure = signal<FailedRequest | null>(null);

  /** The interceptor sends people here with ?reason=expired when a 401 ended their session. */
  protected readonly expired = this.route.snapshot.queryParamMap.get('reason') === 'expired';

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected submit(): void {
    this.failure.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (failure: FailedRequest) => {
        this.submitting.set(false);
        this.failure.set(failure);
      },
    });
  }

  protected fieldError(name: string): string | null {
    return this.failure()?.fields?.[name] ?? null;
  }
}
