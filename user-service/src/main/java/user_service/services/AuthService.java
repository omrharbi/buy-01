package user_service.services;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import user_service.collection.User;
import user_service.dto.AuthResponse;
import user_service.dto.LoginRequest;
import user_service.dto.RegisterRequest;
import user_service.dto.UserDto;
import user_service.repositories.UserRepository;


@Service
@RequiredArgsConstructor
public class AuthService {

    final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthResponse loginService(LoginRequest request, String token) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("user not found"));
        
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("invalid password");
        }

        AuthResponse response = new AuthResponse();
        response.setUser(mapToDTO(user));
        response.setToken(token);

        return response;
    }

    public UserDto registerService(RegisterRequest request){
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("user already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        String hashed = passwordEncoder.encode(request.getPassword());

        user.setPassword(hashed);

        user.setRole(user_service.collection.Role.valueOf(request.getRole()));

        User savedUser = userRepository.save(user);

        return mapToDTO(savedUser);
    }

    private UserDto mapToDTO(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }
}