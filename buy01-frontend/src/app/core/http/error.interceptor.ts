import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ApiError, FailedRequest } from '../models/api-error.model';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../notify/toast.service';

/**
 * Turns every HTTP failure into a sentence, and handles the two session-level cases centrally:
 *
 *  - 401 — the session is gone: clear it and route to sign-in, which explains why.
 *  - 403 — the caller is signed in but this is not theirs: stay put and say so in a toast.
 *
 * Everything else is rethrown as a FailedRequest for the component to place: a field message
 * belongs under its field, not in a banner.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(request).pipe(
    catchError((response: HttpErrorResponse) => {
      const failure = toFailure(response);

      if (failure.status === 401 && auth.isAuthenticated()) {
        auth.logout('expired');
      } else if (failure.status === 403) {
        toast.danger(failure.message);
      } else if (failure.status === 0 || failure.status >= 500) {
        toast.danger('Something went wrong on our side. Try again.');
      }

      return throwError(() => failure);
    }),
  );
};

function toFailure(response: HttpErrorResponse): FailedRequest {
  const body = response.error as ApiError | null;
  return {
    status: response.status,
    message: body?.message?.trim() || defaultMessage(response.status),
    fields: body?.fields ?? {},
  };
}

function defaultMessage(status: number): string {
  switch (status) {
    case 0:
      return "Can't reach the server. Check your connection and try again.";
    case 400:
      return 'Some of that information needs fixing.';
    case 401:
      return 'Your session expired. Sign in to continue.';
    case 403:
      return "This belongs to another seller, so you can't change it.";
    case 404:
      return "That doesn't exist any more.";
    case 409:
      return 'Someone changed this while you were editing. Reload to see the latest.';
    default:
      return 'Something went wrong on our side. Try again.';
  }
}
