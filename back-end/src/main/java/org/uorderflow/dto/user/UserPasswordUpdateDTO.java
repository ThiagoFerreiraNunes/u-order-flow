package org.uorderflow.dto.user;

import jakarta.validation.constraints.NotBlank;

public record UserPasswordUpdateDTO(
        String currentPassword,
        @NotBlank String newPassword
) {
}
