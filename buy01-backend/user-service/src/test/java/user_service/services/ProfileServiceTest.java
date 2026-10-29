package user_service.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import user_service.collection.Role;
import user_service.collection.User;
import user_service.dto.ProfileUpdateRequest;
import user_service.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProfileService profileService;

    @Test
    void profileUpdateCannotChangeEmailOrRole() {
        User user = new User();
        user.setId("client-id");
        user.setName("Client");
        user.setEmail("client@example.com");
        user.setRole(Role.CLIENT);

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setName("Updated Client");
        request.setAvatarUrl("https://example.com/avatar.png");

        when(userRepository.findById("client-id")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        profileService.updateCurrentUser("client-id", request);

        assertEquals("Updated Client", user.getName());
        assertEquals("https://example.com/avatar.png", user.getAvatarUrl());
        assertEquals("client@example.com", user.getEmail());
        assertEquals(Role.CLIENT, user.getRole());
        verify(userRepository).save(user);
    }
}
