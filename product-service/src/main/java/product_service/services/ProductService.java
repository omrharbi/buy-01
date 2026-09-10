package product_service.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import product_service.Exception.InvalidProductRequestException;
import product_service.Exception.ProductNotFoundException;
import product_service.Mapper.ProductMapper;
import product_service.collections.Product;
import product_service.client.MediaClient;
import product_service.dto.ProductDto;
import product_service.dto.RequestProduct;
import product_service.repositories.ProductRepository;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MediaClient mediaClient;

    public ProductDto getProductById(String productId) {
        if (productId == null || productId.isEmpty()) {
            throw new InvalidProductRequestException("Product ID cannot be null or empty");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));
        return productMapper.toDto(product);
    }

    public ProductDto createProduct(RequestProduct productData) {
        if (productData.getName() == null || productData.getName().isEmpty()) {
            throw new InvalidProductRequestException("Product name is required");
        }
        if (productData.getPrice() <= 0) {
            throw new InvalidProductRequestException("Price must be greater than 0");
        }
        Product product = productMapper.toEntity(productData);
        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }

    public ProductDto createProductWithImage(RequestProduct productData, MultipartFile image) {
        Product product = productMapper.toEntity(productData);
        Product saved = productRepository.save(product);

        MediaClient.MediaResponse media = mediaClient.uploadImage(
                image, saved.getId(), productData.getUserId());
        saved.getImageUrls().add(media.getUrl());
        return productMapper.toDto(productRepository.save(saved));
    }

    public ProductDto updateProduct(String productId, RequestProduct updatedData) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));

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

        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }

    public void deleteProduct(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));
        productRepository.delete(product);
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toDto)
                .toList();
    }

    public ProductDto addImageUrl(String productId, String url) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));
        product.getImageUrls().add(url);
        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }
}