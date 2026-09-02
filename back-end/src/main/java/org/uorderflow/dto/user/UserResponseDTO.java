package org.uorderflow.dto.user;

import org.uorderflow.model.User;

public record UserResponseDTO(
        Long id,
        String name,
        String email,
        String role
) {
    public UserResponseDTO(User user) {
        this(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getDescription()
        );
    }
}
