package user_service.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import user_service.dto.AuthResponse;
import user_service.dto.LoginRequest;
import user_service.dto.RegisterRequest;
import user_service.dto.UserDto;
import user_service.services.AuthService;



@RestController
@RequestMapping({"/auth", "/api/auth"})
@RequiredArgsConstructor
class AuthController{

    final AuthService authService;
    @PostMapping("/login")          
    public ResponseEntity<AuthResponse> loginUser(@RequestBody @Valid LoginRequest request){
        AuthResponse authResponse = authService.loginService(request);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@RequestBody @Valid RegisterRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerService(request));
    }
}