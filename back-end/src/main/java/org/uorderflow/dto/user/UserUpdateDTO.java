package org.uorderflow.dto.user;

import jakarta.validation.constraints.Email;
import org.uorderflow.enums.user.UserRole;

public record UserUpdateDTO(
        String name,
        @Email String email,
        UserRole role
) {
}
