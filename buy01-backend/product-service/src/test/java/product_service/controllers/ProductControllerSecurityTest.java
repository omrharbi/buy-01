package product_service.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import product_service.Exception.ProductForbiddenException;
import product_service.Mapper.ProductMapper;
import product_service.collections.Product;
import product_service.dto.ProductDto;
import product_service.dto.RequestProduct;
import product_service.repositories.ProductRepository;
import product_service.security.JwtPrincipal;
import product_service.services.ProductService;

@SpringBootTest
class ProductControllerSecurityTest {

    @Autowired
    private ProductController productController;

    @Test
    void clientCannotCreateProduct() {
        RequestProduct request = new RequestProduct();
        request.setName("Test Product");
        request.setPrice(10.0);
        request.setQuantity(1);

        JwtPrincipal principal = new JwtPrincipal("client-user", "Client User", "client@example.com", "CLIENT");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_CLIENT"))));

        try {
            assertThrows(AccessDeniedException.class,
                    () -> productController.createProduct(request, principal));
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    @Test
    void nonOwnerCannotUpdateProduct() {
        ProductRepository repository = mock(ProductRepository.class);
        ProductMapper mapper = mock(ProductMapper.class);
        ProductService service = new ProductService(repository, mapper);

        Product product = new Product();
        product.setId("prod-1");
        product.setSellerId("owner-1");
        product.setName("Original");
        product.setDescription("desc");
        product.setPrice(10.0);
        product.setQuantity(2);

        when(repository.findById("prod-1")).thenReturn(Optional.of(product));

        RequestProduct payload = new RequestProduct();
        payload.setName("Updated product");
        payload.setPrice(12.0);
        payload.setQuantity(5);

        JwtPrincipal principal = new JwtPrincipal("other-user", "Other User", "other@example.com", "SELLER");

        assertThrows(ProductForbiddenException.class,
                () -> service.updateProduct("prod-1", payload, principal));
    }

    @Test
    void ownerCanUpdateProduct() {
        ProductRepository repository = mock(ProductRepository.class);
        ProductMapper mapper = mock(ProductMapper.class);
        ProductService service = new ProductService(repository, mapper);

        Product product = new Product();
        product.setId("prod-2");
        product.setSellerId("owner-2");
        product.setName("Original");
        product.setDescription("desc");
        product.setPrice(8.0);
        product.setQuantity(1);

        ProductDto updated = new ProductDto();
        updated.setId("prod-2");
        updated.setName("Updated product");
        updated.setSellerId("owner-2");
        updated.setPrice(12.0);
        updated.setQuantity(5);

        when(repository.findById("prod-2")).thenReturn(Optional.of(product));
        when(repository.save(product)).thenReturn(product);
        when(mapper.toDto(product)).thenReturn(updated);

        RequestProduct payload = new RequestProduct();
        payload.setName("Updated product");
        payload.setPrice(12.0);
        payload.setQuantity(5);

        JwtPrincipal principal = new JwtPrincipal("owner-2", "Owner", "owner@example.com", "SELLER");

        ProductDto result = service.updateProduct("prod-2", payload, principal);
        assertEquals("Updated product", result.getName());
    }
}
