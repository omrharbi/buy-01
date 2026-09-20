package product_service.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import product_service.dto.ProductDto;
import product_service.dto.RequestProduct;
import product_service.services.ProductService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{productId}")
    public ProductDto getProductById(@PathVariable String productId) {
        return productService.getProductById(productId);
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> createProduct(
            @ModelAttribute RequestProduct productData,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProductWithImages(productData, images));
    }

    @PutMapping("/{productId}")
    public ProductDto updateProduct(@PathVariable String productId, @RequestBody RequestProduct updatedData) {
        return productService.updateProduct(productId, updatedData);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<ProductDto> getAllProducts() {
        return productService.getAllProducts();
    }

    @PutMapping("/{productId}/images")
    public ProductDto addImage(@PathVariable String productId, @RequestParam String url) {
        return productService.addImageUrl(productId, url);
    }
}