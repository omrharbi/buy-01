package user_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;



@Data
public class LoginRequest {
    @NotBlank(message = "Email is required")
    String email;
    @NotBlank(message = "Password is required")
    String password;
}