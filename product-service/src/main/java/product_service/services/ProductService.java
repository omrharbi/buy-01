package product_service.services;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import product_service.collections.Product;
import product_service.dto.ProductDto;
import product_service.dto.RequestProduct;
import product_service.repositories.ProductRepository;



@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;


    public ProductDto getProductById(String productId) {
        if (productId == null || productId.isEmpty()) {
            throw new IllegalArgumentException("Product ID cannot be null or empty");
        }
        Product product = productRepository.findById(productId).orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return mapToDTO(product);
    }

    public ProductDto createProduct(RequestProduct productData) {
        Product product = new Product();
        product.setName(productData.getName());
        product.setDescription(productData.getDescription());
        product.setPrice(productData.getPrice());
        product.setQuantity(productData.getQuantity());
        product.setUserId(productData.getUserId());
        productRepository.save(product);
        return mapToDTO(product);
    }

    public ProductDto updateProduct(String productId, RequestProduct updatedData) {
        if (productId == null || productId.isEmpty()) {
            throw new IllegalArgumentException("Product ID cannot be null or empty");
        }

        if (!productRepository.existsById(productId)) {
            throw new IllegalArgumentException("Product not found");
        }

        Product product = productRepository.findById(productId).orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (updatedData.getName() != null) {
            product.setName(updatedData.getName());
        }
        if (updatedData.getDescription() != null) {
            product.setDescription(updatedData.getDescription());  
        }

        if (updatedData.getPrice() != 0) {
            product.setPrice(updatedData.getPrice());
        }
        if (updatedData.getQuantity() != 0) {
            product.setQuantity(updatedData.getQuantity());
        }
        productRepository.save(product);
        return mapToDTO(product);
    }

    public void deleteProduct(String productId) {


        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        productRepository.delete(product);
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