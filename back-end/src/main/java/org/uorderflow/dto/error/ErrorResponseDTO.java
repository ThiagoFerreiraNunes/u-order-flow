package org.uorderflow.dto.error;

public record ErrorResponseDTO(
        int status,
        String message
) {
}
