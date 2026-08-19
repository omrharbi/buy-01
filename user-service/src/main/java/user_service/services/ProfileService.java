package user_service.services;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import user_service.collection.User;
import user_service.dto.UserDto;
import user_service.repositories.UserRepository;




@Service
@RequiredArgsConstructor
public class ProfileService {
    final private UserRepository userRepository;

    public UserDto getCurrentUser(String id) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
        
        return mapToDTO(user);
    }

    public UserDto updateCurrentUser(String id, UserDto updatedUserDto) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
         User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));

        if (updatedUserDto.getName() != null) {
            user.setName(updatedUserDto.getName());
        }
        if (updatedUserDto.getEmail() != null) {
            user.setEmail(updatedUserDto.getEmail());
        } 
        if (updatedUserDto.getRole() != null) {
            user.setRole(updatedUserDto.getRole());
        }

        if (updatedUserDto.getAvatar() != null) {
            user.setAvatar(updatedUserDto.getAvatar());
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
        return dto;
    }
    
}