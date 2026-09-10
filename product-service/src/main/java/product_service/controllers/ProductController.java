package product_service.controllers;

import java.util.List;

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

    @PostMapping
    public ProductDto createProduct(@RequestBody RequestProduct productData) {
        return productService.createProduct(productData);
    }

    @PostMapping(value = "/with-image", consumes = "multipart/form-data")
    public ProductDto createProductWithImage(
            @RequestPart("product") RequestProduct productData,
            @RequestPart("file") MultipartFile image) {
        return productService.createProductWithImage(productData, image);
    }

    @PutMapping("/{productId}")
    public ProductDto updateProduct(@PathVariable String productId, @RequestBody RequestProduct updatedData) {
        return productService.updateProduct(productId, updatedData);
    }

    @DeleteMapping("/{productId}")
    public void deleteProduct(@PathVariable String productId) {
        productService.deleteProduct(productId);
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