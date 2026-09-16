package user_service.exception;

import org.springframework.http.HttpStatus;

public class InvalidUserRequestException extends ApiException {
    public InvalidUserRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
