# buy-01 Marketplace

An Angular marketplace frontend backed by Spring Boot microservices.

## Features

- Client and seller registration/login with BCrypt password hashing and JWT authentication.
- Public product catalog; sellers can manage their own products.
- Image uploads to Cloudinary with MongoDB metadata and file validation.
- Kafka connects media and product services asynchronously: uploads with a `productId`
  publish an image event, and product-service adds the image URL to that product.
- Angular pages for authentication, product browsing, seller product/media management,
  and profiles.

## Services and local ports

| Component | Port |
|---|---:|
| Angular frontend | 4200 |
| API Gateway | 8080 |
| User service | 8081 |
| Product service | 8082 |
| Media service | 8083 |
| Eureka | 8761 |
| Kafka | 9092 |
| MongoDB databases | 27018–27020 |

## Run locally

Prerequisites: JDK 17+, Node.js/npm, Docker Compose, and Cloudinary credentials.

Start MongoDB and Kafka from the repository root:

```bash
cd buy01-backend
docker compose -f Docker-db/docker-compose.yml up -d
docker compose -f Docker-db/kafka/docker-compose.yml up -d
```

In separate terminals, start each backend service:

```bash
cd buy01-backend/eureka-server && ./mvnw spring-boot:run
cd buy01-backend/user-service && ./mvnw spring-boot:run
cd buy01-backend/product-service && ./mvnw spring-boot:run
cd buy01-backend/media-service && ./mvnw spring-boot:run
cd buy01-backend/api-gateway && ./mvnw spring-boot:run
```

Set the same strong `JWT_SECRET` for the user, product, and media services. Provide
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to media-service.
The checked-in local infrastructure settings are for development only.

Start the frontend:

```bash
cd buy01-frontend
npm ci
npm start
```

Open <http://localhost:4200>. The frontend uses the local API Gateway at
<http://localhost:8080>.

## API examples

All paths below are served through the gateway:

| Method | Path | Access |
|---|---|---|
| `POST` | `/auth/register`, `/auth/login` | Public |
| `GET`, `PUT` | `/me` | Authenticated |
| `GET` | `/products/list`, `/products/view/{id}` | Public |
| `GET` | `/products/my` | Seller |
| `POST` | `/products/create` | Seller |
| `PUT`, `DELETE` | `/products/update/{id}`, `/products/delete/{id}` | Product owner |
| `POST` | `/media/images/upload` | Seller |
| `GET` | `/media/images/me` | Seller |
| `PUT`, `DELETE` | `/media/images/{id}` | Media owner |

Create a product first, then upload its image with that product's ID. Kafka processes the
association asynchronously, so the product's image list may update shortly after the upload.

## Verification and limitations

The Angular production build and backend service test suites have passed. A live Docker/browser
end-to-end run has not been completed. Automated coverage for full authentication, role and
ownership flows, media upload, and Kafka linkage is limited; verify these flows before relying
on a deployment. Rotate any credentials that were previously committed, and do not use local
development secrets or database credentials in production.
