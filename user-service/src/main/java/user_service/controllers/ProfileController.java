package user_service.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import user_service.dto.UserDto;
import user_service.services.ProfileService;

@RestController("/me")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService userService;

    @GetMapping()
    public UserDto getMyProfile(String id) {
          return userService.getCurrentUser(id);
    }

    @PutMapping()
    public UserDto updateMyProfile(String id, @RequestBody UserDto updatedUserDto) {
        return userService.updateCurrentUser(id, updatedUserDto);
    }
}