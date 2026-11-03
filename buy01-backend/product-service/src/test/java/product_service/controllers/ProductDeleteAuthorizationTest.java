package product_service.controllers;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import product_service.Exception.ProductForbiddenException;
import product_service.Mapper.ProductMapper;
import product_service.collections.Product;
import product_service.repositories.ProductRepository;
import product_service.security.JwtPrincipal;
import product_service.services.ProductService;

class ProductDeleteAuthorizationTest {

    @Test
    void nonOwnerCannotDeleteProduct() {
        ProductRepository repository = mock(ProductRepository.class);
        ProductMapper mapper = mock(ProductMapper.class);
        ProductService service = new ProductService(repository, mapper);

        Product product = new Product();
        product.setId("prod-delete-1");
        product.setSellerId("owner-1");
        product.setName("Protected");
        product.setDescription("desc");
        product.setPrice(10.0);
        product.setQuantity(2);

        when(repository.findById("prod-delete-1")).thenReturn(Optional.of(product));

        JwtPrincipal principal = new JwtPrincipal("other-user", "Other User", "other@example.com", "SELLER");

        assertThrows(ProductForbiddenException.class, () -> service.deleteProduct("prod-delete-1", principal));
    }
}
