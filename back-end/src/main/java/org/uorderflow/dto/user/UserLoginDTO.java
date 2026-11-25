package org.uorderflow.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserLoginDTO(
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(min = 6, max = 50) String password
) {
}
