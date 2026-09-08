package org.uorderflow.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserPasswordUpdateDTO(
        @Size(min = 6, max = 50) String currentPassword,
        @NotBlank @Size(min = 6, max = 50) String newPassword
) {
}
