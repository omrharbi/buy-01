package product_service.Exception;

import org.springframework.http.HttpStatus;

public class ProductNotFoundException extends ApiException {
    public ProductNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
