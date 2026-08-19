package product_service.services;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import product_service.collections.Product;
import product_service.dto.ProductDto;
import product_service.repositories.ProductRepository;



@Service
@RequiredArgsConstructor
public class ProductService {
    final ProductRepository productRepository;


    public ProductDto getProductById(String productId) {
        if (productId == null || productId.isEmpty()) {
            throw new IllegalArgumentException("Product ID cannot be null or empty");
        }
        Product product = productRepository.findById(productId).orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return mapToDTO(product);
    }

    

    

    public String createProduct(String productData) {
        return "Product created with data: " + productData;
    }

    public String updateProduct(String productId, String updatedData) {
        return "Product with ID: " + productId + " updated with data: " + updatedData;
    }

    public String deleteProduct(String productId) {
        return "Product with ID: " + productId + " deleted.";
    }

    public List<ProductDto> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream().map(this::mapToDTO).toList();
    }

    private ProductDto mapToDTO(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        dto.setUserId(product.getUserId());
        return dto;
    }
}