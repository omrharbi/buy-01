package user_service.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import user_service.dto.AuthResponse;
import user_service.dto.LoginRequest;
import user_service.dto.RegisterRequest;
import user_service.dto.UserDto;
import user_service.services.AuthService;



@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
class AuthController{
    final AuthService authService;

    @PostMapping("/login")
    public  ResponseEntity<AuthResponse> loginUser(LoginRequest request, String token){
        AuthResponse authResponse = authService.loginService(request, token);
        return ResponseEntity.status(200).body(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(RegisterRequest request){
        return ResponseEntity.ok(authService.registerService(request));
    }
}