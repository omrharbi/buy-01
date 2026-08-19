package user_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 15, message = "Name must be between 3 and 15 characters")
    String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    String email;

    @NotBlank(message = "Password is required") 
    @Size(min = 6, max = 15, message = "Password must be between 6 and 15 characters")
    String password;
    
    @Size(max = 255, message = "Avatar must be less than 255 characters")
    String avatar;

    @NotBlank(message = "Role is required")
    String role;

}