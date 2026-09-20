import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { FailedRequest } from '../../../core/models/api-error.model';
import { Role } from '../../../core/models/user.model';
import { Alert } from '../../../ui/alert/alert';
import { Button } from '../../../ui/button/button';
import { FormField } from '../../../ui/form-field/form-field';

/**
 * Registration. The role choice sits above the password on purpose: a person should know
 * what they are signing up as before they commit to it.
 */
@Component({
  selector: 'app-sign-up',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Alert, Button, FormField],
  templateUrl: './sign-up.html',
  styleUrl: '../auth.css',
})
export class SignUp {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly submitting = signal(false);
  protected readonly failure = signal<FailedRequest | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['CLIENT' as Role, [Validators.required]],
  });

  protected pick(role: Role): void {
    this.form.controls.role.setValue(role);
    this.form.controls.role.markAsDirty();
  }

  protected submit(): void {
    this.failure.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: (response) => {
        void this.router.navigateByUrl(response.user.role === 'SELLER' ? '/seller/dashboard' : '/products');
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
