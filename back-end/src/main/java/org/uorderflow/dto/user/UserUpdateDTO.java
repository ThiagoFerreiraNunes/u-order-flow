package org.uorderflow.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import org.uorderflow.enums.user.UserRole;

public record UserUpdateDTO(
        @Size(max = 100) String name,
        @Size(max = 100) @Email String email,
        UserRole role
) {
}
