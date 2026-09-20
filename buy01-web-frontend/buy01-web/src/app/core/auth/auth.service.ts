import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API } from '../config/api.config';
import { AuthResponse, Credentials, ProfileUpdate, RegisterRequest, Role, User } from '../models/user.model';

const TOKEN_KEY = 'buy01.token';
const USER_KEY = 'buy01.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly tokenSignal = signal<string | null>(this.read(TOKEN_KEY));
  private readonly userSignal = signal<User | null>(this.readUser());

  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);
  readonly isSeller = computed(() => this.userSignal()?.role === 'SELLER');

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API.auth.register, request).pipe(tap((res) => this.accept(res)));
  }

  login(credentials: Credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API.auth.login, credentials).pipe(tap((res) => this.accept(res)));
  }
  
  refreshProfile(): Observable<User> {
    return this.http.get<User>(API.users.me).pipe(tap((user) => this.setUser(user)));
  }

  updateProfile(update: ProfileUpdate): Observable<User> {
    return this.http.put<User>(API.users.me, update).pipe(tap((user) => this.setUser(user)));
  }

  hasRole(role: Role): boolean {
    return this.userSignal()?.role === role;
  }

  /** Clears the session. `reason` is what the sign-in page will explain on arrival. */
  logout(reason?: 'expired' | 'manual'): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/sign-in'], {
      queryParams: reason === 'expired' ? { reason: 'expired' } : {},
    });
  }

  private accept(response: AuthResponse): void {
    this.tokenSignal.set(response.token);
    localStorage.setItem(TOKEN_KEY, response.token);
    this.setUser(response.user);
  }

  private setUser(user: User): void {
    this.userSignal.set(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private readUser(): User | null {
    const raw = this.read(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
