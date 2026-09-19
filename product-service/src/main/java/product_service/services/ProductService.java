package product_service.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import product_service.client.MediaClient;
import product_service.Exception.InvalidProductRequestException;
import product_service.Exception.ProductNotFoundException;
import product_service.Mapper.ProductMapper;
import product_service.collections.Product;
// import product_service.client.MediaClient;
import product_service.dto.ProductDto;
import product_service.dto.RequestProduct;
import product_service.repositories.ProductRepository;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MediaClient mediaClient;
    private final MongoTemplate mongoTemplate;

    public ProductDto getProductById(String productId) {
        if (productId == null || productId.isBlank()) {
            throw new InvalidProductRequestException("Product ID cannot be null or empty");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));
        return productMapper.toDto(product);
    }

    public ProductDto createProduct(RequestProduct productData) {
        if (productData == null || productData.getName() == null || productData.getName().isBlank()) {
            throw new InvalidProductRequestException("Product name is required");
        }
        if (productData.getPrice() == null || productData.getPrice() <= 0) {
            throw new InvalidProductRequestException("Price must be greater than 0");
        }
        if (productData.getQuantity() == null || productData.getQuantity() < 0) {
            throw new InvalidProductRequestException("Quantity cannot be negative");
        }
        Product product = productMapper.toEntity(productData);
        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }

    public ProductDto createProductWithImages(RequestProduct productData, List<MultipartFile> images) {
        List<MultipartFile> files = images == null ? List.of()
                : images.stream().filter(f -> f != null && !f.isEmpty()).toList();

        if (!files.isEmpty() && (productData.getUserId() == null || productData.getUserId().isBlank())) {
            throw new InvalidProductRequestException("userId is required to upload images");
        }

        ProductDto created = createProduct(productData);
        if (files.isEmpty()) {
            return created;
        }

        List<String> uploadedMediaIds = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                MediaClient.MediaInfo media = mediaClient.upload(file, created.getId(), productData.getUserId());
                uploadedMediaIds.add(media.id());
                addImageUrl(created.getId(), media.url());
            }
        } catch (RuntimeException e) {
            uploadedMediaIds.forEach(id -> mediaClient.delete(id, productData.getUserId()));
            productRepository.deleteById(created.getId());
            throw e;
        }
        return getProductById(created.getId());
    }

    public ProductDto updateProduct(String productId, RequestProduct updatedData) {
        if (updatedData == null) {
            throw new InvalidProductRequestException("Product data is required");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));

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
        if (url == null || url.isBlank()) {
            throw new InvalidProductRequestException("Image URL is required");
        }
        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException("Product not found: " + productId);
        }
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("id").is(productId)),
                new Update().addToSet("imageUrls", url),
                Product.class);
        return getProductById(productId);
    }
}
