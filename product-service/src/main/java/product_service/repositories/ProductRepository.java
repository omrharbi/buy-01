package product_service.repositories;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

import product_service.collections.Product;

public interface ProductRepository extends MongoRepository<Product, String> {

    Optional<Product> findById(String productId);
    
}