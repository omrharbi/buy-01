package product_service.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import product_service.dto.ProductDto;
import product_service.dto.RequestProduct;
import product_service.security.JwtPrincipal;
import product_service.services.ProductService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProductDto> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/me")
    public List<ProductDto> getMyProducts(@AuthenticationPrincipal JwtPrincipal principal) {
        return productService.getMyProducts(principal);
    }

    @GetMapping("/{productId}")
    public ProductDto getProductById(@PathVariable String productId) {
        return productService.getProductById(productId);
    }

    @PostMapping
    public ResponseEntity<ProductDto> createProduct(
            @RequestBody RequestProduct productData, @AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(productData, principal));
    }

    @PutMapping("/{productId}")
    public ProductDto updateProduct(
            @PathVariable String productId,
            @RequestBody RequestProduct updatedData,
            @AuthenticationPrincipal JwtPrincipal principal) {
        return productService.updateProduct(productId, updatedData, principal);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable String productId, @AuthenticationPrincipal JwtPrincipal principal) {
        productService.deleteProduct(productId, principal);
        return ResponseEntity.noContent().build();
    }
}
