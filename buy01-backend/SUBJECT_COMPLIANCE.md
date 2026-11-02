# Buy-01 subject compliance status

## Scope

This project is evaluated against the official 01-edu Buy-01 project requirement: a Spring Boot microservices + Angular e-commerce platform with seller/client roles, product management, media handling, JWT authentication, and secure access control.

## Status by requirement

| Requirement | Status | Evidence |
|---|---|---|
| Microservice architecture | Done | Backend modules are separated under `buy01-backend/` and registered with Eureka |
| User registration and auth | Done | `user-service` handles auth and JWT issuance |
| Client/seller roles | Done | Role-based routing and guards in the Angular app |
| Product CRUD | Done | Product controller + service implement CRUD |
| Media uploads with validation | Done | Media service validates file type and size |
| Seller-only product/media mutations | Done | Security filters and service ownership checks enforce it |
| Angular frontend flows | Done | Frontend app under `buy01-frontend/src/app` |
| Password hashing | Done | BCrypt password encoder is configured |
| HTTPS | Partial / local dev TLS | gateway configured with self-signed cert for local HTTPS |
| Full deployment security hardening | Partial | secrets and production deployment need final externalization |
| Subject-style testing | Partial | core security and validation tests added |
| Final audit pass | In progress | this document tracks remaining items |

## Verified checks

- User service auth/security tests pass.
- Media validation tests pass.
- Product ownership checks pass.
- Gateway responds successfully over HTTPS on port 8443.

## Remaining items

1. Final audit of all API contracts.
2. Final deployment secret hygiene.
3. Expand tests to cover all required subject scenarios.
4. Review documentation for local production-like deployment path.

## Notes

The app is now aligned with the Buy-01 concept and core subject requirements, but it still requires a final compliance pass before claiming full subject completion.
