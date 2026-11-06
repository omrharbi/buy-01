# buy-01 marketplace

This repository contains an Angular marketplace UI and a Spring Boot backend made up of
independently runnable services. This README is the repository-level status and setup guide;
the service-level READMEs predate some of the current code, so use the routes and limits
documented here as the current implementation.

## Project status

| Area | Status | What is present |
|---|---|---|
| User service | Implemented, authorization needs work | Registration and login, BCrypt password encoding, JWT issue/validation, and profile read/update |
| Product service | Implemented; authorization test needs repair | Public catalog reads, SELLER-only write and seller-list routes, and product ownership checks on update/delete |
| Media service | Implemented, limits need alignment | Cloudinary storage, MongoDB media metadata, upload validation, SELLER-only write and seller-list routes, and owner checks on media update/delete |
| Gateway and discovery | Implemented for local development | Spring Cloud Gateway routes and Eureka service registry |
| Asynchronous events | Partially implemented | Media publishes `IMAGE_UPLOADED`; Product consumes it and appends the image URL to the product |
| Angular application | Implemented | Auth/profile, public catalog, seller catalog and media screens, guards, interceptors, reactive forms, and image validation |
| Production readiness | Incomplete | Secrets, profile privilege escalation, upload limits, health checks, frontend production API configuration, and broader tests need attention |

### Implemented functionality

- **Authentication and accounts:** `CLIENT` and `SELLER` registration, login, signed JWTs,
  BCrypt password hashing, and profile retrieval/update.
- **Products:** list/detail reads, seller-specific listing, creation, partial updates, deletion,
  product input checks for name/price/quantity, and ownership checks before update/delete.
- **Media:** image upload to Cloudinary with a MongoDB metadata record, media listing and
  retrieval, replacement/deletion with owner checks, and MIME/content detection with Apache Tika.
- **Frontend:** sign-in/sign-up, role-based route guards, token/error interceptors, catalog and
  product detail, seller dashboard and product forms, media manager, profile page, responsive
  components, and browser-side file/price/quantity validators.
- **Local infrastructure:** Docker Compose definitions for three MongoDB instances and Kafka.
- **Error handling:** backend exception handlers return JSON errors for common validation,
  authorization, not-found, and upload-size errors.

## Remaining bugs, mismatches and risks

Rechecked against the current source on 2026-10-29. **The Cloudinary credentials have been
removed from the current configuration, but still need rotation because they were committed
previously.**

### Critical / fix before sharing or deploying

1. **Previously committed Cloudinary credentials must be rotated.** The current media
   service configuration now requires environment variables and contains no provider
   credentials. Treat the previously committed values as compromised: rotate them with
   Cloudinary and inspect repository history and logs. Do not copy old values into docs or
   another file.
2. **FIXED: profile updates cannot change account role or email.** `PUT /me` now accepts a
   dedicated request DTO containing only name and avatar URL. The service does not mutate
   role or email from profile requests.

### Broken or incorrect behavior

3. **Production frontend API calls do not match the Gateway routes.** `api.config.ts` imports
   `environment.development` directly, so a production build still uses the localhost gateway
   URL instead of `environment.ts`. Even if changed to `/api`, the current Gateway routes match
   `/me`, `/products/**`, and `/media/**`, not `/api/me`, `/api/products/**`, or
   `/api/media/**`. Production auth also routes `/api/auth/**` to User, but User Security
   permits `/auth/**` only. Production profile/catalog/media requests therefore will not reach
   their intended handlers without coordinated environment, Gateway, and security-path fixes.
4. **Upload size requirement is inconsistent.** The UI validates 2 MiB, but Media accepts
   5 MiB in both service validation and multipart configuration. A request made outside the
   UI can exceed the advertised/project limit. Set the server-side limit to 2 MiB or update
   the agreed requirement and all frontend messages/validators.
5. **Registration can still create duplicate emails under concurrency.** Profile email
   changes are not supported. The user model has no declared unique email index, so
   registration's pre-check alone is not safe against concurrent duplicate registrations.
6. **Media library and image reads expose more than needed.** `GET /media/images` and
   `GET /media/images/{id}` are public. Their DTO includes `ownerId` and Cloudinary
   `publicId`, and list-all returns every seller's metadata. Restrict listing to an owner/admin
   or remove it, and return a public DTO without internal identifiers. Also, the ID endpoint
   returns metadata containing a URL; it does not stream image bytes or set the requested
   caching headers (Cloudinary may serve the URL separately).
7. **Product/media links can become stale.** Media delete does not remove its URL from a
   product. Media replacement publishes a new URL, while the Product consumer only appends it;
   the old URL remains. Cloudinary, MongoDB and Kafka changes are not transactional, and the
   producer does not inspect the async Kafka send result. Failed events can leave saved media
   unlinked from products.
8. **Frontend load failures can look like empty data.** Product list, seller dashboard, and
   media manager hide the loading state on failure but do not show an error/retry message.
   Profile refresh silently ignores failure and can leave cached data displayed.
9. **Unexpected backend errors can leak implementation details.** Product and Media generic
   exception handlers include `e.getMessage()` in the HTTP response. Return a generic message
   to clients and log diagnostic details server-side. User service also lacks a generic
   exception handler, so its unexpected-error response shape is inconsistent.
10. **The Product security test is currently failing.** Running
    `cd buy01-backend/product-service && ./mvnw -q -Dtest=ProductControllerSecurityTest test`
    fails at MockMvc setup with `springSecurityFilterChain cannot be null`; it never reaches
    the assertion that a CLIENT is forbidden. Repair the test setup before treating role
    enforcement as regression-tested.

### Incomplete, inconsistent or not yet verified

11. **Authorization progress:** Product writes and seller-list reads, plus Media writes and
    seller media listing, now require `SELLER`; Product updates/deletes and Media updates/
    deletes also check ownership. The client-to-product regression test does not currently run,
    and no equivalent Media-role/ownership tests were found.
12. **No business-level automated coverage.** Most backend tests only load Spring contexts;
    no Angular spec files were found. There is no end-to-end test of signup/login, role
    enforcement, ownership, file limits/sniffing, Kafka linkage, or the frontend flows.
13. **Actuator health checks are not evidenced.** No explicit Actuator dependency or health
    endpoint configuration was found. Verify `/actuator/health` on each required service and
    add health checks to local/deployment orchestration.
14. **Local-only CORS and deployment protections.** Gateway CORS allows only
    `http://localhost:4200`. No HTTPS/TLS or rate limiting configuration was found. The
    development JWT fallback and local MongoDB credentials must not be used in deployment.
    JWTs are stored in browser `localStorage`, so XSS prevention is essential.
15. **API paths differ from the assignment contract.** The running UI/backend currently use
    `/products/list`, `/products/view/{id}`, `/products/create`, `/products/update/{id}`,
    `/products/delete/{id}`, and `/media/images/upload` instead of the brief's REST-style
    paths. The current development UI matches those backend routes; clients built to the
    assignment paths will not.
16. **Stale unused MediaClient code remains.** `product_service.client.MediaClient` calls
    `/api/media` and `/api/media/{id}` with `X-User-Id`, which do not match the implemented
    Media endpoints or JWT-based auth. It is not referenced by the current Product service,
    but would fail if wired in without updating it.
17. **Validation rules disagree.** Backend registration permits names up to 15 characters and
    passwords 6–15 characters; the frontend name form permits up to 60 and requires only a
    minimum of 8. Profile updates now validate name/avatar URL size on the backend, but signup
    rules still need alignment. Decide on an adequate password/passphrase policy.
18. **Development mock API is disabled.** The mock interceptor exists but
    `useMockApi` is `false`; the SPA needs the local backend and dependencies to be running
    for its development flows. This is a setup requirement, not a working offline demo.
19. **Small cleanup:** `ProductForm` and mock API code contain debug `console.log` calls.

Not evidenced as implemented: OAuth2, an ADMIN role/moderation flow, `PRODUCT_CREATED`
events, a complete single-command deployment Compose stack, production HTTPS, gateway rate
limiting, and production-grade secret/object-storage configuration.

## Architecture

```text
Angular SPA (:4200)
        |
        v
API Gateway (:8080) ---- Eureka registry (:8761)
   |         |      |
   v         v      v
 User      Product  Media
 :8081      :8082   :8083
   |          |       |
 MongoDB    MongoDB  MongoDB + Cloudinary
              ^       |
              +-- Kafka (image-uploaded-topic)
```

| Module | Local port | Responsibility |
|---|---:|---|
| `user-service` | 8081 | Authentication, account roles, and profile |
| `product-service` | 8082 | Product catalog and seller ownership |
| `media-service` | 8083 | Image validation, Cloudinary upload, and media metadata |
| `api-gateway` | 8080 | External API routes, local CORS policy, service discovery |
| `eureka-server` | 8761 | Service registry/dashboard |
| Frontend | 4200 | Angular single-page application |
| MongoDB | 27018–27020 | Separate local databases for Product, Media, and User |
| Kafka | 9092 | Image-upload event transport |

**Image event flow:** Media uploads an image, stores its metadata, and publishes an
`ImageUploadedEvent` when a `productId` is supplied. Product consumes the event and adds the
URL to that product. Standalone uploads (such as the profile avatar/media-library flow) do not
include a product ID.

## Gateway API

Use `http://localhost:8080` as the base URL in local development.

| Method | Path | Access in current backend |
|---|---|---|
| `POST` | `/auth/register` | Public |
| `POST` | `/auth/login` | Public |
| `GET` | `/me` | Authenticated |
| `PUT` | `/me` | Authenticated; backend currently accepts more fields than the UI edits |
| `GET` | `/products/list` | Public |
| `GET` | `/products/view/{productId}` | Public |
| `GET` | `/products/my` | SELLER |
| `POST` | `/products/create` | SELLER |
| `PUT` | `/products/update/{productId}` | SELLER and product owner |
| `DELETE` | `/products/delete/{productId}` | SELLER and product owner |
| `POST` | `/media/images/upload` | SELLER |
| `GET` | `/media/images/me` | SELLER |
| `GET` | `/media/images` and `/media/images/{id}` | Public in current backend |
| `PUT` | `/media/images/{id}` | SELLER and media owner |
| `DELETE` | `/media/images/{id}` | SELLER and media owner |

Product creation accepts a JSON request body, then the frontend uploads pending files
separately with the new product ID. The backend Product controller paths are `/products/list`,
`/products/view/{id}`, `/products/create`, `/products/update/{id}`, and
`/products/delete/{id}`. The Media upload path is `/media/images/upload`; these differ from
the shorter endpoint examples in the assignment description.

The User controller also declares `/api/auth/**` aliases, but those routes are not included
in the User service's public security matcher. The frontend and examples should use
`/auth/register` and `/auth/login` until that mismatch is corrected.

## Run locally

### Prerequisites

- JDK 17 or newer and the Maven wrapper included in each backend module
- Node.js/npm compatible with the lockfile (the package declares npm 10.9.7)
- Docker Engine with Docker Compose
- Cloudinary credentials supplied securely to the media service

### Start infrastructure

From the repository root:

```bash
cd buy01-backend
docker compose -f Docker-db/docker-compose.yml up -d
docker compose -f Docker-db/kafka/docker-compose.yml up -d
```

The MongoDB Compose file uses local development credentials and publishes separate ports.
Do not reuse those credentials outside local development.

### Start backend services

Start each command in its own terminal, from the repository root, in this order:

```bash
cd buy01-backend/eureka-server && ./mvnw spring-boot:run
cd buy01-backend/user-service && ./mvnw spring-boot:run
cd buy01-backend/product-service && ./mvnw spring-boot:run
cd buy01-backend/media-service && ./mvnw spring-boot:run
cd buy01-backend/api-gateway && ./mvnw spring-boot:run
```

All three services that validate JWTs must use the same strong `JWT_SECRET`; set it in the
environment of each process. The default configured JWT value is for local development only.
Before starting Media, remove the hard-coded Cloudinary values from its YAML configuration,
wire the `cloudinary.*` settings to environment variables or a secret manager, and provide
the replacement credentials there. Current MongoDB and Kafka configuration targets services
on `localhost`.

### Start the frontend

```bash
cd buy01-frontend
npm ci
npm start
```

Open `http://localhost:4200`. Development API calls target `http://localhost:8080`. An
in-memory mock interceptor exists, but it is **disabled** in the current development
environment (`useMockApi: false`).

## Validation performed

The following checks passed in the previous workspace check:

- `cd buy01-frontend && npm run build`
- `./mvnw test -q` in `user-service`, `product-service`, `media-service`, `api-gateway`,
  and `eureka-server` before the new Product security test was added

The current Product module test suite includes a new targeted security test, but it does not
pass: `cd buy01-backend/product-service && ./mvnw -q -Dtest=ProductControllerSecurityTest test`
fails with `springSecurityFilterChain cannot be null` while building MockMvc, before the test
assertion runs. The other backend tests are primarily context-load smoke tests and do not
verify full end-to-end behavior.

## Repository map

```text
buy01-backend/
  api-gateway/       Gateway routes and CORS
  eureka-server/     Service registry
  user-service/      JWT auth, BCrypt, profiles
  product-service/  Product persistence, authorization, Kafka consumer
  media-service/    Upload validation, Cloudinary, Kafka producer
  Docker-db/         MongoDB and Kafka Compose definitions
buy01-frontend/
  src/app/core/      API clients, auth, guards, interceptors, models
  src/app/features/  Auth, catalog, seller, profile, and error pages
  src/app/shared/    Reusable validators
  src/app/ui/        Shared UI components
```
