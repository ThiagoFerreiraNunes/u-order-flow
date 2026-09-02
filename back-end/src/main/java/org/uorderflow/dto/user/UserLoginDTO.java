package org.uorderflow.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserLoginDTO(
        @NotBlank @Size(max = 100) String email,
        @NotBlank @Size(min = 6, max = 50) String password
) {
}
