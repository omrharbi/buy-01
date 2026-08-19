package user_service.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import user_service.dto.LoginRequest;
import user_service.dto.RegisterRequest;
import user_service.services.AuthService;



@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
class AuthController{
    final AuthService authService;

    @PostMapping("/login")
    public String loginUser(LoginRequest request, String token){
        return authService.loginService(request, token).toString();
    }

    @PostMapping("/register")
    public String registerUser(RegisterRequest request){
        return authService.registerService(request).toString();
    }
}