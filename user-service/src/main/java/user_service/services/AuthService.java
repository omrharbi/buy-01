package user_service.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import user_service.collection.User;
import user_service.dto.AuthResponse;
import user_service.dto.LoginRequest;
import user_service.dto.RegisterRequest;
import user_service.dto.UserDto;
import user_service.collection.Role;
import user_service.exception.InvalidCredentialsException;
import user_service.exception.InvalidUserRequestException;
import user_service.exception.UserAlreadyExistsException;
import user_service.repositories.UserRepository;
import user_service.security.JwtService;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse loginService(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));
        System.out.println("User found: " + request.getPassword() + ", Role: " + request.getPassword());
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        AuthResponse response = new AuthResponse();
        response.setUser(mapToDTO(user));
        response.setToken(jwtService.generateToken(user));

        return response;
    }

    public UserDto registerService(RegisterRequest request){
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("A user with this email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        String hashed = passwordEncoder.encode(request.getPassword());

        user.setPassword(hashed);

        try {
            user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new InvalidUserRequestException("Role must be one of: SELLER, BUYER");
        }

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