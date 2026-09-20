# buy-01 — Angular front end

The marketplace SPA: clients browse products, sellers manage a catalog and its images. Angular 21 standalone components with signals, Tailwind v4 for layout, and the **Buy-01 design system** for every colour, type style and spacing value.

It ships with an in-memory backend, so it runs and is fully clickable with nothing else started.

## Run it

```bash
npm install
npm start          # http://localhost:4200
```

Sign in with one of the seeded accounts:

| Email | Password | Role |
| --- | --- | --- |
| `seller@buy01.test` | `password123` | SELLER |
| `client@buy01.test` | `password123` | CLIENT |
| `maison@buy01.test` | `password123` | SELLER |

Build for production with `npm run build`; the output lands in `dist/buy01-web/browser`.

## Pointing it at the real services

`src/environments/environment.development.ts` decides:

```ts
export const environment = {
  production: false,
  apiBase: 'http://localhost:8080',  // the gateway
  useMockApi: true,                  // set to false to call the services
};
```

Set `useMockApi: false` and the mock interceptor steps aside — every request goes to `apiBase` instead. The production environment already has it off and calls `/api`.

The endpoints the app expects, all through the gateway:

| Method | Path | Who |
| --- | --- | --- |
| `POST` | `/auth/register` · `/auth/login` | public — returns `{ token, expiresIn, user }` |
| `GET` `PUT` | `/me` | authenticated |
| `GET` | `/products` · `/products/{id}` | public |
| `GET` | `/products/me` | the signed-in seller's own catalog |
| `POST` `PUT` `DELETE` | `/products` · `/products/{id}` | SELLER, owner only |
| `POST` | `/media/images` | SELLER — multipart field `file` |
| `GET` | `/media/images/me` | SELLER |
| `DELETE` | `/media/images/{id}` | SELLER, owner only |

Errors are expected in one shape — `{ status, message, fields? }` — where `fields` maps a field name to a message so a `400` lands under the input that caused it.

## How it's laid out

One responsibility per file.

```
src/app/
  core/
    models/        user · product · media · api-error
    config/        api.config.ts — every URL and the media limits, in one place
    auth/          auth.service.ts · auth.guard.ts · role.guard.ts
    http/          token.interceptor.ts · error.interceptor.ts
    api/           product.api.ts · media.api.ts
    notify/        toast.service.ts
    mock/          mock-api.interceptor.ts · mock-data.ts   (development only)
  shared/validators/
    image-file.validator.ts   MIME + size + magic bytes
    price.validator.ts        price > 0, whole quantity
  ui/              button · badge · alert · empty-state · form-field · product-card
                   · avatar · image-uploader · icon · toast-host
  features/
    auth/          sign-in · sign-up (role choice above the password)
    catalog/       product-list (public grid) · product-detail
    seller/        dashboard · product-form · media-manager
    profile/       GET /me, PUT /me, avatar upload
    errors/        forbidden (RoleGuard) · not-found
  app.routes.ts    every feature lazy-loaded
  theme.service.ts light/dark on <html>
```

## What the plumbing does

**AuthGuard** sends anonymous visitors to `/sign-in` with a `returnUrl`. **RoleGuard** reads `data.role` from the route and renders `/forbidden` for a client who reaches the seller area — explained, not bounced.

**tokenInterceptor** attaches the JWT, and only to calls that go to our own API, so the token never reaches a third party. **errorInterceptor** handles the two session-level cases centrally: a `401` clears the session and routes to sign-in with an explanation, a `403` leaves the route alone and raises a toast. Everything else is rethrown as a `FailedRequest` for the component to place — a field message belongs under its field.

**Forms** are reactive. Errors appear only once a control is dirty or touched; a `400` that names a field is routed into that field's message row. The message row is always rendered, even empty, so nothing shifts when an error appears.

## Upload rules

The Media service takes images only, up to 2 MB, from sellers. The UI states all three under the dropzone before a file is picked, and checks each one in the browser before a byte goes out:

1. `file.type` starts with `image/` and is JPEG, PNG or WebP
2. `file.size <= 2 * 1024 * 1024`
3. the first 12 bytes carry a real JPEG / PNG / WebP signature
4. at most 6 images per product

A rejected file never enters the queue: it appears as one line in a single alert, named and with its real size. Accepted files get an instant local thumbnail and a per-file progress bar. The service validates all of it again — this is a courtesy, not the enforcement.

One thing the architecture makes true and the UI says out loud: an image uploads on its own request, so **uploaded images stay in the media library even if the product is never saved**.

## The design system

`src/assets/design-system/` holds `tokens.css` (both themes, the type classes, `@font-face` for the seven woff2 files), `theme.css` (the Tailwind `@theme` mapping) and the Bootstrap Icons sprite. They are imported in that order in `src/styles.css`.

Rules for templates: no hex literals, no `text-[13px]`, no `rounded-[10px]`. Spacing utilities map one-to-one (`p-4` is `space-4`); type uses the system classes (`class="heading-sm"`). A value that is not in the system is a change to the system, made there first.

Theme lives on `<html data-theme>`, set in `index.html` before first paint so nothing flashes.

## Accessibility

Focus is never removed, only replaced with `2px solid var(--focus-ring)` at 2px offset. Field errors are wired with `aria-invalid` and `aria-describedby` and are text, not colour. Alerts and toasts are live regions — `role="alert"` for warnings and failures, `role="status"` otherwise. Icon-only controls (remove image, row actions) carry an `aria-label` naming the thing they act on. Status is never colour alone: every status badge and alert carries an icon and a word.

## Licences

Bootstrap Icons 1.13.1 — MIT. Public Sans, Space Grotesk, JetBrains Mono — SIL OFL 1.1.
