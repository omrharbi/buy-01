package user_service.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import user_service.collection.Role;
import user_service.collection.User;
import user_service.dto.LoginRequest;
import user_service.dto.RegisterRequest;
import user_service.dto.UserDto;
import user_service.exception.InvalidCredentialsException;
import user_service.exception.UserAlreadyExistsException;
import user_service.repositories.UserRepository;
import user_service.security.JwtService;

class AuthServiceSecurityTest {

    @Test
    void registerServiceHashesPasswordAndKeepsSellerRole() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        JwtService jwtService = mock(JwtService.class);
        AuthService authService = new AuthService(userRepository, passwordEncoder, jwtService);

        RegisterRequest request = new RegisterRequest();
        request.setName("Alice");
        request.setEmail("alice@example.com");
        request.setPassword("secret123");
        request.setRole("SELLER");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("user-1");
            return user;
        });

        UserDto dto = authService.registerService(request);

        assertEquals("user-1", dto.getId());
        assertEquals("Alice", dto.getName());
        assertEquals(Role.SELLER, dto.getRole());
    }

    @Test
    void loginServiceRejectsWrongPassword() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        JwtService jwtService = mock(JwtService.class);
        AuthService authService = new AuthService(userRepository, passwordEncoder, jwtService);

        User user = new User();
        user.setEmail("alice@example.com");
        user.setPassword(passwordEncoder.encode("secret123"));
        user.setRole(Role.SELLER);
        user.setName("Alice");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setEmail("alice@example.com");
        request.setPassword("wrong-pass");

        assertThrows(InvalidCredentialsException.class, () -> authService.loginService(request));
    }

    @Test
    void registerServiceRejectsDuplicateEmail() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        JwtService jwtService = mock(JwtService.class);
        AuthService authService = new AuthService(userRepository, passwordEncoder, jwtService);

        RegisterRequest request = new RegisterRequest();
        request.setName("Alice");
        request.setEmail("alice@example.com");
        request.setPassword("secret123");
        request.setRole("SELLER");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(new User()));

        assertThrows(UserAlreadyExistsException.class, () -> authService.registerService(request));
    }
}
