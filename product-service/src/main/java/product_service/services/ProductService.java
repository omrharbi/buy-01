package product_service.services;

import org.springframework.stereotype.Service;



@Service
public class ProductService {

    public String getProductById(String productId) {
        return "Product with ID: " + productId;
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

    public String getAllProducts() {
        return "List of all products.";
    }
}