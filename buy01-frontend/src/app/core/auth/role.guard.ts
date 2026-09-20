import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Role } from '../models/user.model';
import { AuthService } from './auth.service';

/**
 * Role check for the seller area. A client who lands on a seller URL is shown the forbidden
 * page rather than bounced: they should understand why, not wonder where they went.
 *
 * Reads the required role from the route's `data.role`.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = route.data['role'] as Role | undefined;

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
  }
  if (!required || auth.hasRole(required)) {
    return true;
  }
  return router.createUrlTree(['/forbidden']);
};
