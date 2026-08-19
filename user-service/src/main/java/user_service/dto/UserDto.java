package user_service.dto;

import lombok.Data;
import user_service.collection.Role;

@Data
public class UserDto {
    String id;
    String email;
    String name;
    String avatar;
    Role role;
}