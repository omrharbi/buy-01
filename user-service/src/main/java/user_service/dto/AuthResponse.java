package user_service.dto;

import lombok.Data;

@Data
public class AuthResponse {

    private String token;
    private UserDto user;
}