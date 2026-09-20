package user_service.collection;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;


@Document(collection= "user")
@Data
public class User {
    @Id
    private String id;
    
    private String name;

    private String email;

    private String password;

    private Role role;

    private String  avatar;
}