package user_service.dto;

import lombok.Data;

@Data
public class UserDto {
    String id;
    String email;
    String name;
    String avatar;
    Enum role;
}