package product_service.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import product_service.dto.ProductDto;
import product_service.services.ProductService;

@RestController
@RequiredArgsConstructor
public class ProductController {
    final ProductService productService;

    @GetMapping("/products/{productId}")
    public ProductDto getProductById(String productId) {
        return productService.getProductById(productId);
    }

    @PostMapping("/products")
    public String createProduct(String productData) {
        return productService.createProduct(productData);
    }

    @PutMapping("/products/{productId}")
    public String updateProduct(String productId, String updatedData) {
        return productService.updateProduct(productId, updatedData);
    }

    @DeleteMapping("/products/{productId}")
    public String deleteProduct(String productId) {
        return productService.deleteProduct(productId);
    }

    @GetMapping("/products")
    public List<ProductDto> getAllProducts() {
        return productService.getAllProducts();
    }
}