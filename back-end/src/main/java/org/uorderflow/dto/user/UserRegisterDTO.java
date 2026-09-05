package org.uorderflow.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.uorderflow.enums.user.UserRole;

public record UserRegisterDTO(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(min = 6, max = 50) String password,
        @NotNull UserRole role
) {
}
