package org.uorderflow.service.authentication;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.uorderflow.dto.user.UserLoginDTO;
import org.uorderflow.dto.user.UserRegisterDTO;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.infra.exception.LoginAlreadyExistsException;
import org.uorderflow.infra.security.TokenService;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @InjectMocks
    private AuthenticationService authenticationService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenService tokenService;

    @Mock
    private PasswordEncoder passwordEncoder;

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

    @Nested
    @DisplayName("login")
    class LoginTests {

        @Test
        @DisplayName("Should authenticate user and return generated JWT token")
        void shouldAuthenticateAndReturnToken() {
            UserLoginDTO loginDTO = new UserLoginDTO("john@email.com", "secret123");
            User user = createMockUser("john@email.com");
            Authentication authenticationMock = mock(Authentication.class);
            when(authenticationMock.getPrincipal()).thenReturn(user);
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(authenticationMock);
            when(tokenService.generateToken(user)).thenReturn("mocked-jwt-token");

            String token = authenticationService.login(loginDTO);

            assertThat(token).isNotNull();
            assertThat(token).isEqualTo("mocked-jwt-token");
            verify(authenticationManager, times(1))
                    .authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(tokenService, times(1)).generateToken(user);
        }
    }

    @Nested
    @DisplayName("register")
    class RegisterTests {

        @Test
        @DisplayName("Should register new user successfully when email is available")
        void shouldRegisterNewUserSuccessfully() {
            UserRegisterDTO registerDTO = new UserRegisterDTO("Jane", "jane@email.com", "password123", UserRole.WAITER);
            when(userRepository.findByEmail(registerDTO.email())).thenReturn(null);
            when(passwordEncoder.encode(registerDTO.password())).thenReturn("$2a$10$encodedPassword");

            authenticationService.register(registerDTO);

            verify(userRepository, times(1)).findByEmail(registerDTO.email());
            verify(passwordEncoder, times(1)).encode(registerDTO.password());
            verify(userRepository, times(1)).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw LoginAlreadyExistsException when email already exists")
        void shouldThrowExceptionWhenEmailAlreadyExists() {
            UserRegisterDTO registerDTO = new UserRegisterDTO("Jane", "jane@email.com", "password123", UserRole.WAITER);
            User existingUser = createMockUser("jane@email.com");

            when(userRepository.findByEmail(registerDTO.email())).thenReturn(existingUser);

            assertThatThrownBy(() -> authenticationService.register(registerDTO))
                    .isInstanceOf(LoginAlreadyExistsException.class)
                    .hasMessage("A user with this email already exists: " + registerDTO.email());
            verify(userRepository, times(1)).findByEmail(registerDTO.email());
            verify(passwordEncoder, never()).encode(any());
            verify(userRepository, never()).save(any());
        }
    }
}