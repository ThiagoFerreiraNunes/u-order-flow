package org.uorderflow.dto.user;

import org.uorderflow.enums.user.UserRole;

public record UserUpdateDTO(
        String name,
        String email,
        UserRole role
) {
}
