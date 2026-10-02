package product_service.services;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import product_service.Exception.InvalidProductRequestException;
import product_service.Exception.ProductForbiddenException;
import product_service.Exception.ProductNotFoundException;
import product_service.Mapper.ProductMapper;
import product_service.collections.Product;
import product_service.dto.ProductDto;
import product_service.dto.RequestProduct;
import product_service.repositories.ProductRepository;
import product_service.security.JwtPrincipal;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductDto getProductById(String productId) {
        if (productId == null || productId.isBlank()) {
            throw new InvalidProductRequestException("Product ID cannot be null or empty");
        }
        Product product = findOrThrow(productId);
        return productMapper.toDto(product);
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toDto)
                .toList();
    }

    public List<ProductDto> getMyProducts(JwtPrincipal principal) {
        return productRepository.findBySellerId(principal.id()).stream()
                .map(productMapper::toDto)
                .toList();
    }

    public ProductDto createProduct(RequestProduct productData, JwtPrincipal principal) {
        validate(productData);

        Product product = productMapper.toEntity(productData);
        product.setSellerId(principal.id());
        product.setSellerName(principal.name());
        product.setCreatedAt(Instant.now());
        if (product.getImageUrls() == null) {
            product.setImageUrls(new java.util.ArrayList<>());
        }

        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }

    public ProductDto updateProduct(String productId, RequestProduct updatedData, JwtPrincipal principal) {
        if (updatedData == null) {
            throw new InvalidProductRequestException("Product data is required");
        }
        Product product = findOrThrow(productId);
        requireOwner(product, principal);

        if (updatedData.getName() != null && !updatedData.getName().isBlank()) {
            product.setName(updatedData.getName());
        }
        if (updatedData.getDescription() != null) {
            product.setDescription(updatedData.getDescription());
        }
        if (updatedData.getPrice() != null) {
            if (updatedData.getPrice() <= 0) {
                throw new InvalidProductRequestException("Price must be greater than 0");
            }
            product.setPrice(updatedData.getPrice());
        }
        if (updatedData.getQuantity() != null) {
            if (updatedData.getQuantity() < 0) {
                throw new InvalidProductRequestException("Quantity cannot be negative");
            }
            product.setQuantity(updatedData.getQuantity());
        }
        if (updatedData.getImageUrls() != null) {
            product.setImageUrls(updatedData.getImageUrls());
        }

        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }

    public void deleteProduct(String productId, JwtPrincipal principal) {
        Product product = findOrThrow(productId);
        requireOwner(product, principal);
        productRepository.delete(product);
    }

    /** Called by the Kafka listener when an image is uploaded against a known product. */
    public void addImageUrl(String productId, String url) {
        if (url == null || url.isBlank()) {
            throw new InvalidProductRequestException("Image URL is required");
        }
        Product product = findOrThrow(productId);
        if (!product.getImageUrls().contains(url)) {
            product.getImageUrls().add(url);
            productRepository.save(product);
        }
    }

    private Product findOrThrow(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));
    }

    private void requireOwner(Product product, JwtPrincipal principal) {
        if (!product.getSellerId().equals(principal.id())) {
            throw new ProductForbiddenException("You do not own this product");
        }
    }

    private void validate(RequestProduct productData) {
        if (productData == null || productData.getName() == null || productData.getName().isBlank()) {
            throw new InvalidProductRequestException("Product name is required");
        }
        if (productData.getPrice() == null || productData.getPrice() <= 0) {
            throw new InvalidProductRequestException("Price must be greater than 0");
        }
        if (productData.getQuantity() == null || productData.getQuantity() < 0) {
            throw new InvalidProductRequestException("Quantity cannot be negative");
        }
    }
}
