import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const KEY = 'buy01.theme';

/**
 * The theme lives on <html>, not on a component root: dialogs and toasts render outside the
 * app's subtree and would otherwise keep the wrong one. index.html sets it before first paint;
 * this service only changes it afterwards.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly current = signal<Theme>(this.read());

  readonly theme = this.current.asReadonly();

  toggle(): void {
    this.set(this.current() === 'dark' ? 'light' : 'dark');
  }

  private set(theme: Theme): void {
    this.current.set(theme);
    document.documentElement.dataset['theme'] = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* a blocked store just means the choice is not remembered */
    }
  }

  private read(): Theme {
    const attribute = document.documentElement.dataset['theme'];
    return attribute === 'dark' ? 'dark' : 'light';
  }
}
