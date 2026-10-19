package product_service.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/list")
    public List<ProductDto> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('SELLER')")
    public List<ProductDto> getMyProducts(@AuthenticationPrincipal JwtPrincipal principal) {
        return productService.getMyProducts(principal);
    }

    @GetMapping("/view/{productId}")
    public ProductDto getProductById(@PathVariable String productId) {
        return productService.getProductById(productId);
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductDto> createProduct(
            @RequestBody RequestProduct productData, @AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(productData, principal));
    }

    @PutMapping("/update/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    public ProductDto updateProduct(
            @PathVariable String productId,
            @RequestBody RequestProduct updatedData,
            @AuthenticationPrincipal JwtPrincipal principal) {
        return productService.updateProduct(productId, updatedData, principal);
    }

    @DeleteMapping("/delete/{productId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable String productId, @AuthenticationPrincipal JwtPrincipal principal) {
        productService.deleteProduct(productId, principal);
        return ResponseEntity.noContent().build();
    }
}
