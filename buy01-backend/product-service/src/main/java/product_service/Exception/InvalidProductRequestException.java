package product_service.Exception;

import org.springframework.http.HttpStatus;

public class InvalidProductRequestException extends ApiException {
    public InvalidProductRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
