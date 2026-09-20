package user_service.controllers;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import user_service.dto.UserDto;
import user_service.services.ProfileService;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService userService;

    @GetMapping
    public UserDto getMyProfile(Authentication authentication) {
        return userService.getCurrentUser(authentication.getName());
    }

    @PutMapping
    public UserDto updateMyProfile(Authentication authentication, @RequestBody UserDto updatedUserDto) {
        return userService.updateCurrentUser(authentication.getName(), updatedUserDto);
    }
}