package user_service.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("auth")
class AuthController{


    @PostMapping("/login")
    public String loginUser(){
        return "hello";
    }

    @PostMapping("register")
    public String registerUser(){
        return "yeah";
    }
}