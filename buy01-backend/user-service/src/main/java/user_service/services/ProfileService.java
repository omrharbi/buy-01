package user_service.services;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import user_service.collection.User;
import user_service.dto.ProfileUpdateRequest;
import user_service.dto.UserDto;
import user_service.exception.UserNotFoundException;
import user_service.repositories.UserRepository;

@Service
@RequiredArgsConstructor
public class ProfileService {
    final private UserRepository userRepository;

    public UserDto getCurrentUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));

        return mapToDTO(user);
    }

    public UserDto updateCurrentUser(String id, ProfileUpdateRequest updateRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));

        if (updateRequest.getName() != null) {
            user.setName(updateRequest.getName());
        }
        if (updateRequest.getAvatarUrl() != null) {
            user.setAvatarUrl(updateRequest.getAvatarUrl());
        }

        User updatedUser = userRepository.save(user);

        return mapToDTO(updatedUser); 
    }

     private UserDto mapToDTO(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }
    
}