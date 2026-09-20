import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, concat, delay, of, throwError, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { MEDIA_RULES } from '../config/api.config';
import { MediaRef } from '../models/media.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { SEED_PRODUCTS, SEED_USERS } from './mock-data';

/**
 * A development-only stand-in for the gateway, so the SPA runs with nothing else started.
 * It mirrors the contract the services expose — including the parts that matter to the UI:
 * ownership is enforced with 403, missing things are 404, bad input is 400 with per-field
 * messages, and uploads report progress before they resolve.
 *
 * Switched on by `environment.useMockApi`. It is never registered in a production build.
 *
 * Sign in with seller@buy01.test / password123 (SELLER) or client@buy01.test / password123.
 */
export const mockApiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!environment.useMockApi) {
    return next(request);
  }
  const handled = route(request);
  return handled ?? next(request);
};

// ---------------------------------------------------------------- storage

const STORE_KEY = 'buy01.mock.state';

interface MockState {
  users: Array<User & { password: string }>;
  products: Product[];
  media: MediaRef[];
}

function load(): MockState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      return JSON.parse(raw) as MockState;
    }
  } catch {
    /* fall through to a fresh seed */
  }
  const seeded: MockState = { users: [...SEED_USERS], products: [...SEED_PRODUCTS], media: [] };
  save(seeded);
  return seeded;
}

function save(state: MockState): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* a full or blocked store just means the session is not persisted */
  }
}

// ---------------------------------------------------------------- helpers

const LATENCY = 220;

function ok<T>(body: T): Observable<HttpEvent<T>> {
  return of(new HttpResponse({ status: 200, body })).pipe(delay(LATENCY));
}

function fail(status: number, message: string, fields?: Record<string, string>): Observable<never> {
  return timer(LATENCY).pipe(
    switchMap(() =>
      throwError(
        () =>
          new HttpErrorResponse({
            status,
            error: { timestamp: new Date().toISOString(), status, error: '', message, path: '', fields },
          }),
      ),
    ),
  );
}

/** A structurally real JWT — header.payload.signature — so the app's token path is exercised. */
function issueToken(user: User): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iss: 'buy01-mock',
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
  };
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.mock-signature`;
}

function caller(request: HttpRequest<unknown>, state: MockState): User | null {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  try {
    const payload = JSON.parse(atob(header.slice(7).split('.')[1]));
    return state.users.find((user) => user.id === payload.sub) ?? null;
  } catch {
    return null;
  }
}

function publicUser(user: User & { password?: string }): User {
  const { id, name, email, role, avatarUrl } = user;
  return { id, name, email, role, avatarUrl };
}

function path(request: HttpRequest<unknown>): string {
  const url = request.url.replace(environment.apiBase.replace(/\/$/, ''), '');
  return url.split('?')[0] || '/';
}

// ---------------------------------------------------------------- routes

function route(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> | null {
  const state = load();
  const url = path(request);
  const method = request.method;
  const body = (request.body ?? {}) as Record<string, string>;

  // ---- auth
  if (method === 'POST' && url === '/auth/register') {
    if (state.users.some((user) => user.email === body['email'])) {
      return fail(400, 'Some fields need fixing.', { email: 'That email is already registered.' });
    }
    const user: User & { password: string } = {
      id: `u-${Date.now()}`,
      name: body['name'],
      email: body['email'],
      role: body['role'] === 'SELLER' ? 'SELLER' : 'CLIENT',
      avatarUrl: null,
      password: body['password'],
    };
    state.users.push(user);
    save(state);
    return ok({ token: issueToken(user), expiresIn: 43200, user: publicUser(user) });
  }

  if (method === 'POST' && url === '/auth/login') {
    const user = state.users.find(
      (candidate) => candidate.email === body['email'] && candidate.password === body['password'],
    );
    return user
      ? ok({ token: issueToken(user), expiresIn: 43200, user: publicUser(user) })
      : fail(401, 'That email and password do not match an account.');
  }

  // ---- profile
  if (url === '/me') {
    const me = caller(request, state);
    if (!me) {
      return fail(401, 'Sign in to continue.');
    }
    if (method === 'GET') {
      return ok(publicUser(me));
    }
    if (method === 'PUT') {
      me.name = body['name'] ?? me.name;
      me.avatarUrl = (body['avatarUrl'] as string | null) ?? null;
      save(state);
      return ok(publicUser(me));
    }
  }

  // ---- products
  if (method === 'GET' && url === '/products') {
    return ok([...state.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  if (method === 'GET' && url === '/products/me') {
    const me = caller(request, state);
    if (!me) {
      return fail(401, 'Sign in to continue.');
    }
    return ok(state.products.filter((product) => product.sellerId === me.id));
  }

  const productMatch = /^\/products\/([^/]+)$/.exec(url);
  if (productMatch) {
    const id = productMatch[1];
    const index = state.products.findIndex((product) => product.id === id);

    if (method === 'GET') {
      return index === -1 ? fail(404, "That product doesn't exist any more.") : ok(state.products[index]);
    }

    const me = caller(request, state);
    if (!me) {
      return fail(401, 'Sign in to continue.');
    }
    if (index === -1) {
      return fail(404, "That product doesn't exist any more.");
    }
    if (state.products[index].sellerId !== me.id) {
      return fail(403, "This product belongs to another seller, so you can't change it.");
    }

    if (method === 'PUT') {
      const invalid = validateProduct(body);
      if (invalid) {
        return fail(400, 'Some fields need fixing.', invalid);
      }
      state.products[index] = { ...state.products[index], ...normalizeProduct(body) };
      save(state);
      return ok(state.products[index]);
    }
    if (method === 'DELETE') {
      state.products.splice(index, 1);
      save(state);
      return ok(null);
    }
  }

  if (method === 'POST' && url === '/products') {
    const me = caller(request, state);
    if (!me) {
      return fail(401, 'Sign in to continue.');
    }
    if (me.role !== 'SELLER') {
      return fail(403, 'Only sellers can list products.');
    }
    const invalid = validateProduct(body);
    if (invalid) {
      return fail(400, 'Some fields need fixing.', invalid);
    }
    const product: Product = {
      id: `p-${Date.now()}`,
      sellerId: me.id,
      sellerName: me.name,
      createdAt: new Date().toISOString(),
      ...normalizeProduct(body),
    };
    state.products.unshift(product);
    save(state);
    return ok(product);
  }

  // ---- media
  if (method === 'POST' && url === '/media/images') {
    const me = caller(request, state);
    if (!me) {
      return fail(401, 'Sign in to continue.');
    }
    if (me.role !== 'SELLER') {
      return fail(403, 'Only sellers can upload images.');
    }
    const file = (request.body as FormData | null)?.get('file');
    if (!(file instanceof File)) {
      return fail(400, 'No file was attached.');
    }
    if (file.size > MEDIA_RULES.maxBytes) {
      return fail(400, `That image is too large. Images must be 2 MB or smaller.`);
    }
    if (!(MEDIA_RULES.acceptedTypes as readonly string[]).includes(file.type)) {
      return fail(400, "That file isn't an image. Upload a JPEG, PNG or WebP.");
    }
    return uploadWithProgress(file, me, state);
  }

  if (method === 'GET' && url === '/media/images/me') {
    const me = caller(request, state);
    if (!me) {
      return fail(401, 'Sign in to continue.');
    }
    return ok(state.media.filter((item) => item.ownerId === me.id));
  }

  const mediaMatch = /^\/media\/images\/([^/]+)$/.exec(url);
  if (mediaMatch && method === 'DELETE') {
    const me = caller(request, state);
    if (!me) {
      return fail(401, 'Sign in to continue.');
    }
    const index = state.media.findIndex((item) => item.id === mediaMatch[1]);
    if (index === -1) {
      return fail(404, 'That image is already gone.');
    }
    if (state.media[index].ownerId !== me.id) {
      return fail(403, "That image belongs to another seller, so you can't delete it.");
    }
    state.media.splice(index, 1);
    save(state);
    return ok(null);
  }

  return null;
}

// ---------------------------------------------------------------- product rules

function validateProduct(body: Record<string, unknown>): Record<string, string> | null {
  const fields: Record<string, string> = {};
  const name = String(body['name'] ?? '').trim();
  const price = Number(body['price']);
  const quantity = Number(body['quantity']);

  if (!name) {
    fields['name'] = 'Give the product a title.';
  } else if (name.length > 80) {
    fields['name'] = 'Keep the title under 80 characters.';
  }
  if (!Number.isFinite(price) || price <= 0) {
    fields['price'] = 'Price must be greater than 0.';
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    fields['quantity'] = 'Enter a whole number, 0 or more.';
  }
  return Object.keys(fields).length ? fields : null;
}

function normalizeProduct(body: Record<string, unknown>) {
  return {
    name: String(body['name'] ?? '').trim(),
    description: String(body['description'] ?? '').trim(),
    price: Number(body['price']),
    quantity: Number(body['quantity']),
    imageUrls: Array.isArray(body['imageUrls']) ? (body['imageUrls'] as string[]) : [],
  };
}

/**
 * Emits a few progress events before the response, so the uploader's per-file bar has
 * something real to animate. The stored URL is a data URL: no object storage here.
 */
function uploadWithProgress(file: File, owner: User, state: MockState): Observable<HttpEvent<MediaRef>> {
  const progress = of(25, 60, 90).pipe(
    delay(120),
    map((value) => ({ type: HttpEventType.UploadProgress, loaded: value, total: 100 }) as HttpEvent<MediaRef>),
  );

  const response = new Observable<HttpEvent<MediaRef>>((subscriber) => {
    const reader = new FileReader();
    reader.onload = () => {
      const media: MediaRef = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: String(reader.result),
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        ownerId: owner.id,
        uploadedAt: new Date().toISOString(),
      };
      state.media.push(media);
      save(state);
      subscriber.next(new HttpResponse({ status: 201, body: media, headers: new HttpHeaders() }));
      subscriber.complete();
    };
    reader.onerror = () => subscriber.error(new HttpErrorResponse({ status: 400, error: { message: 'Could not read that file.' } }));
    reader.readAsDataURL(file);
  });

  return concat(progress, response);
}
