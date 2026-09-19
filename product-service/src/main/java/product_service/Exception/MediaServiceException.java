package product_service.Exception;

import org.springframework.http.HttpStatus;

public class MediaServiceException extends ApiException {
    public MediaServiceException(HttpStatus status, String message) {
        super(status, message);
    }
}
