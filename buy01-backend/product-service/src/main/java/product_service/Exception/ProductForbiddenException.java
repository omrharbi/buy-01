package product_service.Exception;

import org.springframework.http.HttpStatus;

public class ProductForbiddenException extends ApiException {
    public ProductForbiddenException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
