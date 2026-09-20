import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API } from '../config/api.config';
import { AuthService } from '../auth/auth.service';

/**
 * Attaches the JWT to calls that go to our own API. Requests to anywhere else — a CDN, an
 * asset — are left untouched, so the token never leaks to a third party.
 */
export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).token();
  const ours = request.url.startsWith(API.base) || request.url.startsWith('/');

  if (!token || !ours) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
