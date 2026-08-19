package product_service.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import product_service.collections.Product;

public interface ProductRepository extends JpaRepository<Product, String> {

    Optional<Product> findById(String productId);
    
}