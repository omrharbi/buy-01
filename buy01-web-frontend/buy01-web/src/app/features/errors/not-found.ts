import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../../ui/button/button';
import { EmptyState } from '../../ui/empty-state/empty-state';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, EmptyState],
  template: `
    <ui-empty-state
      icon="box-seam"
      title="That page doesn't exist"
      body="The link may be out of date, or the thing it pointed at was removed.">
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
export class NotFound {}
