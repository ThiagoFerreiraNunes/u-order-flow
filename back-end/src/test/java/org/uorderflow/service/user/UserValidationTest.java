package org.uorderflow.service.user;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.uorderflow.enums.user.UserAction;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.infra.exception.LoginAlreadyExistsException;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserValidationTest {

    @InjectMocks
    private UserValidation userValidation;

    @Mock
    private UserRepository userRepository;

    private User createDummyUser(Long id, UserRole role, Boolean isDeleted) {
        return new User(
                id,
                "John Doe",
                "john@email.com",
                "$2a$10$encodedPassword",
                role != null ? role : UserRole.WAITER,
                isDeleted != null ? isDeleted : false
        );
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when user does not exist")
    void shouldThrowExceptionWhenUserNotFound() {
        Long id = 1L;
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userValidation.validateUser(id, UserAction.ACTIVE_CHECK))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessage("User not found with id " + id + ".");

        verify(userRepository, times(1)).findById(id);
    }

    @Nested
    @DisplayName("ACTIVE_CHECK Action")
    class ActiveCheckActionTests {

        @Test
        @DisplayName("Should pass validation when user is active")
        void shouldValidateActiveUser() {
            Long id = 1L;
            User user = createDummyUser(id, UserRole.WAITER, false);

            when(userRepository.findById(id)).thenReturn(Optional.of(user));

            User result = userValidation.validateUser(id, UserAction.ACTIVE_CHECK);

            assertThat(result).isEqualTo(user);
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when user is deleted")
        void shouldThrowExceptionWhenUserIsDeleted() {
            Long id = 1L;
            User user = createDummyUser(id, UserRole.WAITER, true);

            when(userRepository.findById(id)).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> userValidation.validateUser(id, UserAction.ACTIVE_CHECK))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("User is deleted with id " + id + ".");
        }
    }

    @Nested
    @DisplayName("CREATE_ORDER Action")
    class CreateOrderActionTests {

        @Test
        @DisplayName("Should pass validation when user is active and has WAITER role")
        void shouldValidateWaiterUserForOrder() {
            Long id = 1L;
            User user = createDummyUser(id, UserRole.WAITER, false);

            when(userRepository.findById(id)).thenReturn(Optional.of(user));

            User result = userValidation.validateUser(id, UserAction.CREATE_ORDER);

            assertThat(result).isEqualTo(user);
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when user is deleted")
        void shouldThrowExceptionWhenUserIsDeletedOnOrderCreate() {
            Long id = 1L;
            User user = createDummyUser(id, UserRole.WAITER, true);

            when(userRepository.findById(id)).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> userValidation.validateUser(id, UserAction.CREATE_ORDER))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("User is deleted with id " + id + ".");
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when user has COOK role")
        void shouldThrowExceptionWhenUserIsCookOnOrderCreate() {
            Long id = 1L;
            User user = createDummyUser(id, UserRole.COOK, false);

            when(userRepository.findById(id)).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> userValidation.validateUser(id, UserAction.CREATE_ORDER))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("A User with the COOK role cannot be associated with an order.");
        }
    }

    @Nested
    @DisplayName("validateUniqueFields")
    class ValidateUniqueFieldsTests {

        @Test
        @DisplayName("Should pass validation when email is unique")
        void shouldPassWhenEmailIsUnique() {
            String email = "unique@email.com";
            when(userRepository.existsByEmail(email)).thenReturn(false);

            userValidation.validateUniqueFields(email);

            verify(userRepository, times(1)).existsByEmail(email);
        }

        @Test
        @DisplayName("Should throw LoginAlreadyExistsException when email already exists")
        void shouldThrowExceptionWhenEmailExists() {
            String email = "existing@email.com";
            when(userRepository.existsByEmail(email)).thenReturn(true);

            assertThatThrownBy(() -> userValidation.validateUniqueFields(email))
                    .isInstanceOf(LoginAlreadyExistsException.class)
                    .hasMessage("A User with the email '" + email + "' already exists.");
        }
    }
}