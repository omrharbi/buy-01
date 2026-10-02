package product_service.security;

public record JwtPrincipal(String id, String name, String email, String role) {
}
