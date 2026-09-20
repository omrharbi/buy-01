import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from './core/auth/auth.service';
import { ThemeService } from './theme.service';
import { Avatar } from './ui/avatar/avatar';
import { Badge } from './ui/badge/badge';
import { Icon } from './ui/icon/icon';
import { ToastHost } from './ui/toast-host/toast-host';

/** The shell: header, the routed page, and the toast stack. */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Avatar, Badge, Icon, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly themes = inject(ThemeService);
}
