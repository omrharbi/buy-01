package user_service.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateRequest {

    @Size(max = 60, message = "Name must be at most 60 characters")
    @Pattern(regexp = "(?s).*\\S.*", message = "Name cannot be blank")
    private String name;

    @Size(max = 255, message = "Avatar URL must be at most 255 characters")
    private String avatarUrl;
}
