package org.uorderflow.service.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.uorderflow.dto.user.UserPasswordUpdateDTO;
import org.uorderflow.dto.user.UserResponseDTO;
import org.uorderflow.dto.user.UserUpdateDTO;
import org.uorderflow.enums.user.UserAction;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserValidation userValidation;

    @Mock
    private PasswordEncoder passwordEncoder;

    private User createMockUser(Long id, UserRole role, Boolean isDeleted) {
        return new User(
                id,
                "Cleber",
                "cleber@email.com",
                "$2a$10$encodedPassword",
                role != null ? role : UserRole.WAITER,
                isDeleted != null ? isDeleted : false
        );
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should throw AccessDeniedException when non-admin requests deleted users")
        void shouldThrowExceptionWhenNonAdminRequestsDeletedUsers() {
            Pageable pageable = PageRequest.of(0, 10);

            assertThatThrownBy(() -> userService.findAll(null, true, null, pageable, false))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessage("Only users with the ADMIN role can view deleted users.");
        }

        @Test
        @DisplayName("Should filter by excludeRole when excludeRole is provided")
        void shouldFilterByExcludeRole() {
            Pageable pageable = PageRequest.of(0, 10);
            User user = createMockUser(1L, UserRole.WAITER, false);
            Page<User> page = new PageImpl<>(List.of(user));
            when(userRepository.findAllPagedExcludingRole(UserRole.COOK, false, pageable)).thenReturn(page);

            Page<UserResponseDTO> result = userService.findAll(null, false, UserRole.COOK, pageable, false);

            assertThat(result).hasSize(1);
            verify(userRepository, times(1)).findAllPagedExcludingRole(UserRole.COOK, false, pageable);
            verify(userRepository, never()).findAllPagedByName(any(), anyBoolean(), any());
            verify(userRepository, never()).findAllPaged(anyBoolean(), any());
        }

        @Test
        @DisplayName("Should filter by name when admin provides name without excludeRole")
        void shouldFilterByNameWhenAdminProvidesName() {
            Pageable pageable = PageRequest.of(0, 10);
            User user = createMockUser(1L, UserRole.WAITER, false);
            Page<User> page = new PageImpl<>(List.of(user));
            when(userRepository.findAllPagedByName("Cleber", false, pageable)).thenReturn(page);

            Page<UserResponseDTO> response = userService.findAll("Cleber", false, null, pageable, true);

            assertThat(response).hasSize(1);
            verify(userRepository, times(1)).findAllPagedByName("Cleber", false, pageable);
            verify(userRepository, never()).findAllPaged(anyBoolean(), any());
        }

        @Test
        @DisplayName("Should return all paged users when admin provides no filters")
        void shouldReturnAllPagedUsersForAdmin() {
            Pageable pageable = PageRequest.of(0, 10);
            User user = createMockUser(1L, UserRole.WAITER, false);
            Page<User> page = new PageImpl<>(List.of(user));
            when(userRepository.findAllPaged(false, pageable)).thenReturn(page);

            Page<UserResponseDTO> result = userService.findAll(null, false, null, pageable, true);

            assertThat(result).hasSize(1);
            verify(userRepository, times(1)).findAllPaged(false, pageable);
        }

        @Test
        @DisplayName("Should throw AccessDeniedException when non-admin calls findAll without excludeRole")
        void shouldThrowExceptionWhenNonAdminCallsFindAllWithoutExcludeRole() {
            Pageable pageable = PageRequest.of(0, 10);

            assertThatThrownBy(() -> userService.findAll(null, false, null, pageable, false))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessage("Only users with the ADMIN role can use the findAll method without the 'exclude-role' parameter.");
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return user when logged user is ADMIN")
        void shouldReturnUserWhenLoggedUserIsAdmin() {
            User loggedAdmin = createMockUser(1L, UserRole.ADMIN, false);
            User targetUser = createMockUser(2L, UserRole.WAITER, false);
            when(userValidation.validateUser(targetUser.getId(), UserAction.ACTIVE_CHECK)).thenReturn(targetUser);

            UserResponseDTO response = userService.findById(2L, loggedAdmin);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(2L);
            verify(userValidation, times(1)).validateUser(targetUser.getId(), UserAction.ACTIVE_CHECK);
        }

        @Test
        @DisplayName("Should return user when non-admin accesses their own ID")
        void shouldReturnUserWhenAccessingOwnId() {
            User loggedWaiter = createMockUser(1L, UserRole.WAITER, false);
            when(userValidation.validateUser(loggedWaiter.getId(), UserAction.ACTIVE_CHECK)).thenReturn(loggedWaiter);

            UserResponseDTO response = userService.findById(loggedWaiter.getId(), loggedWaiter);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(loggedWaiter.getId());
            verify(userValidation, times(1)).validateUser(loggedWaiter.getId(), UserAction.ACTIVE_CHECK);
        }

        @Test
        @DisplayName("Should throw AccessDeniedException when non-admin accesses another user's ID")
        void shouldThrowExceptionWhenAccessingOtherUser() {
            User loggedWaiter = createMockUser(1L, UserRole.WAITER, false);

            assertThatThrownBy(() -> userService.findById(2L, loggedWaiter))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessage("Users with the WAITER role can only use the findById method with their own ids.");
            verify(userValidation, never()).validateUser(any(), any());
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("Should update name and role without validating email if email is unchanged")
        void shouldUpdateNameAndRoleWithoutEmailValidation() {
            UserUpdateDTO updateDTO = new UserUpdateDTO("John", "cleber@email.com", UserRole.CASHIER);
            User user = createMockUser(1L, UserRole.WAITER, false);

            when(userValidation.validateUser(user.getId(), UserAction.ACTIVE_CHECK)).thenReturn(user);

            UserResponseDTO response = userService.update(user.getId(), updateDTO);

            assertThat(response).isNotNull();
            assertThat(user.getName()).isEqualTo("John");
            assertThat(user.getRole()).isEqualTo(UserRole.CASHIER);
            verify(userValidation, never()).validateUniqueFields(any());
        }

        @Test
        @DisplayName("Should validate unique email and update user when new email is provided")
        void shouldValidateAndChangeEmail() {
            UserUpdateDTO updateDTO = new UserUpdateDTO("John", "new@email.com", UserRole.WAITER);
            User user = createMockUser(1L, UserRole.WAITER, false);
            when(userValidation.validateUser(user.getId(), UserAction.ACTIVE_CHECK)).thenReturn(user);

            UserResponseDTO response = userService.update(user.getId(), updateDTO);

            assertThat(response).isNotNull();
            assertThat(user.getEmail()).isEqualTo("new@email.com");
            verify(userValidation, times(1)).validateUniqueFields("new@email.com");
        }
    }

    @Nested
    @DisplayName("updatePassword")
    class UpdatePasswordTests {

        @Test
        @DisplayName("Should throw AccessDeniedException when non-admin tries to update another user's password")
        void shouldThrowExceptionWhenNonAdminUpdatesOthersPassword() {
            User loggedUser = createMockUser(1L, UserRole.WAITER, false);
            UserPasswordUpdateDTO dto = new UserPasswordUpdateDTO("oldPass", "newPass");

            assertThatThrownBy(() -> userService.updatePassword(2L, dto, loggedUser))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessage("Users with the WAITER role can only update their own passwords.");
        }

        @Test
        @DisplayName("Should throw BadCredentialsException when non-admin provides wrong current password")
        void shouldThrowExceptionWhenCurrentPasswordIsWrong() {
            User loggedUser = createMockUser(1L, UserRole.WAITER, false);
            UserPasswordUpdateDTO dto = new UserPasswordUpdateDTO("wrongPass", "newPass");
            when(userValidation.validateUser(loggedUser.getId(), UserAction.ACTIVE_CHECK)).thenReturn(loggedUser);
            when(passwordEncoder.matches("wrongPass", loggedUser.getPassword())).thenReturn(false);

            assertThatThrownBy(() -> userService.updatePassword(1L, dto, loggedUser))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("The current password provided is incorrect.");
        }

        @Test
        @DisplayName("Should update password successfully for non-admin with correct current password")
        void shouldUpdatePasswordForSelf() {
            User loggedUser = createMockUser(1L, UserRole.WAITER, false);
            UserPasswordUpdateDTO dto = new UserPasswordUpdateDTO("oldPass", "newPass");
            when(userValidation.validateUser(loggedUser.getId(), UserAction.ACTIVE_CHECK)).thenReturn(loggedUser);
            when(passwordEncoder.matches("oldPass", loggedUser.getPassword())).thenReturn(true);
            when(passwordEncoder.encode("newPass")).thenReturn("$2a$10$newEncodedPassword");

            userService.updatePassword(loggedUser.getId(), dto, loggedUser);

            assertThat(loggedUser.getPassword()).isEqualTo("$2a$10$newEncodedPassword");
        }

        @Test
        @DisplayName("Should allow admin to update any password without validating current password")
        void shouldAllowAdminToUpdatePasswordWithoutCurrentPasswordCheck() {
            User adminUser = createMockUser(1L, UserRole.ADMIN, false);
            User targetUser = createMockUser(2L, UserRole.WAITER, false);
            UserPasswordUpdateDTO dto = new UserPasswordUpdateDTO(null, "newPass");
            when(userValidation.validateUser(targetUser.getId(), UserAction.ACTIVE_CHECK)).thenReturn(targetUser);
            when(passwordEncoder.encode("newPass")).thenReturn("$2a$10$adminSetEncodedPassword");

            userService.updatePassword(targetUser.getId(), dto, adminUser);

            assertThat(targetUser.getPassword()).isEqualTo("$2a$10$adminSetEncodedPassword");
            verify(passwordEncoder, never()).matches(any(), any());
        }
    }

    @Nested
    @DisplayName("State Transitions (delete, reactivate)")
    class StateTransitionTests {

        @Test
        @DisplayName("Should delete user when delete is called")
        void shouldDeleteUser() {
            User user = createMockUser(1L, UserRole.WAITER, false);
            when(userValidation.validateUser(user.getId(), UserAction.DELETE)).thenReturn(user);

            userService.delete(user.getId());

            assertThat(user.getIsDeleted()).isTrue();
            verify(userValidation, times(1)).validateUser(user.getId(), UserAction.DELETE);
        }

        @Test
        @DisplayName("Should reactivate user when reactivate is called")
        void shouldReactivateUser() {
            User user = createMockUser(1L, UserRole.WAITER, true);
            when(userValidation.validateUser(user.getId(), UserAction.REACTIVATE)).thenReturn(user);

            UserResponseDTO response = userService.reactivate(user.getId());

            assertThat(response).isNotNull();
            assertThat(user.getIsDeleted()).isFalse();
            verify(userValidation, times(1)).validateUser(user.getId(), UserAction.REACTIVATE);
        }
    }
}