import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../../ui/button/button';
import { EmptyState } from '../../ui/empty-state/empty-state';

/**
 * Where the RoleGuard sends a client who reached a seller URL. It explains the role rather
 * than bouncing them, and it is neutral in tone: this is not a mistake they made.
 */
@Component({
  selector: 'app-forbidden',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, EmptyState],
  template: `
    <ui-empty-state
      icon="shield-lock"
      title="This area is for sellers"
      body="Your account is a client account, so the catalog tools aren't available. You can browse and buy everything in the marketplace.">
      <a routerLink="/products"><ui-button variant="secondary">Back to products</ui-button></a>
    </ui-empty-state>
  `,
  styles: [
    `
      a {
        text-decoration: none;
      }
    `,
  ],
})
export class Forbidden {}
