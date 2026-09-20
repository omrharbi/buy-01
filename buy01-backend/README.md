# buy-01

A small e-commerce backend built as Spring Boot microservices. Clients talk only to the API Gateway; services find each other through Eureka and exchange image events over Kafka.

## Architecture

```
                     +------------------+
   client  --------> |   api-gateway    | :8080
                     +--------+---------+
            /api/auth, /api/users | /api/products | /media
                     +----------+----------+----------+
                     v                     v          v
              user-service          product-service  media-service
                 :8081                  :8082           :8083
                   |                      |  ^            |
               MongoDB :27020       MongoDB :27018   MongoDB :27019
                                          |  |            |
                                          |  +-- Kafka ---+   (topic: image-uploaded-topic)
                                          v
                          all services register with eureka-server :8761
```

| Module | Port | Purpose |
|---|---|---|
| eureka-server | 8761 | Service registry (dashboard at http://localhost:8761) |
| api-gateway | 8080 | Single entry point, routes by path via Eureka |
| user-service | 8081 | Register, login (JWT), profile |
| product-service | 8082 | Product CRUD, consumes image events |
| media-service | 8083 | Image upload/CRUD on Cloudinary, publishes image events |

Gateway routes:

| Path | Service |
|---|---|
| `/api/auth/**`, `/api/users/**` | user-service |
| `/api/products/**` | product-service |
| `/media/**` | media-service |

**Image flow:** uploading an image to media-service stores it on Cloudinary, saves a record, and publishes an `ImageUploadedEvent` to Kafka. product-service consumes it and adds the URL to the product's `imageUrls` (duplicates are ignored).

## Prerequisites

- JDK 17+
- Maven 3.8+
- Docker with the Compose plugin
- A Cloudinary account (for media uploads)

## Running everything

Start infrastructure first, then the services in this order.

```bash
# 1. Databases (3 MongoDB containers) and Kafka
cd Docker-db && docker compose up -d
cd kafka && docker compose up -d && cd ../..

# 2. Eureka (wait until http://localhost:8761 loads)
cd eureka-server && mvn spring-boot:run

# 3. Business services, each in its own terminal
cd user-service    && mvn spring-boot:run
cd product-service && mvn spring-boot:run
cd media-service   && mvn spring-boot:run

# 4. Gateway last
cd api-gateway && mvn spring-boot:run
```

Check http://localhost:8761: `USER-SERVICE`, `PRODUCT-SERVICE`, `MEDIA-SERVICE` and `API-GATEWAY` should all show `UP`. After (re)starting a service, the gateway can return `503` for up to ~30 seconds while it refreshes its service list.

## Configuration

Each service is configured in `src/main/resources/application.yaml`.

| Setting | Where | Notes |
|---|---|---|
| MongoDB URIs | each service | Match the credentials in `Docker-db/docker-compose.yml` (`root` / `password`) |
| `jwt.secret` | user-service | Override with the `JWT_SECRET` environment variable (32+ characters). The default is for local dev only |
| `jwt.expiration-ms` | user-service | Token lifetime, default 24 hours |
| `cloudinary.*` | media-service | Cloud name, API key and API secret |
| Multipart limit | media-service | 5 MB per file |

> Do not commit real secrets. Move the Cloudinary API secret out of `application.yaml` into an environment variable before publishing the repository.

## API reference

All requests go through the gateway: `http://localhost:8080`.

### Auth and users

| Method | Path | Body | Success |
|---|---|---|---|
| POST | `/api/auth/register` | `{name, email, password, role}` | 201 user |
| POST | `/api/auth/login` | `{email, password}` | 200 `{token, user}` |
| GET | `/api/users/me` | none, needs `Authorization: Bearer <token>` | 200 user |
| PUT | `/api/users/me` | partial user JSON, needs the token | 200 user |

Rules: `role` is `SELLER` or `BUYER`; `name` is 3-15 characters; `password` is 6-15 characters; `email` must be valid.

### Products

| Method | Path | Notes | Success |
|---|---|---|---|
| POST | `/api/products/create` | multipart form: `name`, `description`, `price`, `quantity`, `userId`, optional `images` (repeat for several files). Creates the product and uploads the images | 201 |
| GET | `/api/products` | list all | 200 |
| GET | `/api/products/{id}` | | 200 |
| PUT | `/api/products/{id}` | partial update | 200 |
| DELETE | `/api/products/{id}` | | 204 |
| PUT | `/api/products/{id}/images?url=...` | add an image URL manually | 200 |

Rules: `name` required, `price` > 0, `quantity` >= 0, `userId` required when sending images. Images are max 5 MB each. Products are created only through this multipart call; images can also be added later with `/media/images/upload`.

### Media

| Method | Path | Notes | Success |
|---|---|---|---|
| POST | `/media/images/upload` | multipart: `file`, `productId`, `userId` | 201 |
| GET | `/media/images` | list all | 200 |
| GET | `/media/images/{id}` | | 200 |
| PUT | `/media/images/{id}` | multipart: `file`, `userId`; replaces the image | 200 |
| DELETE | `/media/images/{id}?userId=...` | also deletes from Cloudinary | 204 |

Rules: images only (checked by content type and by file content), max 5 MB. Only the uploader (`userId`) can replace or delete.

### Error responses

Errors return the HTTP status with a plain-text message.

| Status | When |
|---|---|
| 400 | Validation failed, bad role, invalid file |
| 401 | Wrong email or password |
| 403 | Missing token on `/api/users/me`, or changing someone else's media |
| 404 | User, product or media not found |
| 409 | Email already registered |
| 500 | Unexpected error |

## Quick end-to-end test

```bash
# register and log in
curl -X POST localhost:8080/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123","role":"SELLER"}'
curl -X POST localhost:8080/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'

# create a product with its images in one call (use the user id from register)
curl -X POST localhost:8080/api/products/create \
  -F name="Cool Mug" -F description="A mug" -F price=9.99 -F quantity=10 -F userId=<USER_ID> \
  -F images=@image1.png -F images=@image2.png
```

The response contains the product with `imageUrls` filled in. If any image is rejected, nothing is kept (the product and already-uploaded images are rolled back).

## Current limitations

- Only `/api/users/me` validates the JWT. Product and media endpoints trust the `userId` sent in the request.
- Kafka runs as a single node, so the compose file sets the offsets and transaction topics to replication factor 1.
- There are no automated tests yet beyond the generated context-load tests.

## Service discovery notes

Service discovery lets microservices find each other without hardcoded addresses.

- **Client-side discovery** (used here, via Eureka): the client asks a registry for the service's address, then calls it directly. There is no load on the registry after lookup.
- **Server-side discovery** (for example Kubernetes Services or AWS ALB): the client calls a load balancer that resolves the target, so clients need no discovery logic.
