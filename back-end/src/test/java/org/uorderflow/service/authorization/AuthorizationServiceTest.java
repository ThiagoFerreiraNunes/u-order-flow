package org.uorderflow.service.authorization;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @InjectMocks
    private AuthorizationService authorizationService;

    @Mock
    private UserRepository userRepository;

    private User createMockUser(String email) {
        return new User(
                1L,
                "John",
                email,
                "$2a$10$encodedPassword",
                UserRole.WAITER,
                false
        );
    }

    @Test
    @DisplayName("Should return UserDetails when user is found by email")
    void shouldReturnUserDetailsWhenUserExists() {
        User user = createMockUser("john@email.com");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(user);

        UserDetails response = authorizationService.loadUserByUsername(user.getEmail());

        assertThat(response).isNotNull();
        assertThat(response.getUsername()).isEqualTo(user.getEmail());
        verify(userRepository, times(1)).findByEmail(user.getEmail());
    }

    @Test
    @DisplayName("Should return null or throw UsernameNotFoundException when user is not found")
    void shouldHandleWhenUserNotFound() {
        String email = "notfound@email.com";
        when(userRepository.findByEmail(email)).thenReturn(null);

        UserDetails response = authorizationService.loadUserByUsername(email);

        assertThat(response).isNull();
        verify(userRepository, times(1)).findByEmail(email);
    }

}