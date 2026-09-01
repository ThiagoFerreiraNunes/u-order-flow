package org.uorderflow.dto.product;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ProductUpdateDTO(
        @Size(max = 100) String name,
        @Size(max = 255) String description,
        @Size(max = 2048) String image,
        @Positive Double price,
        Long productCategoryId,
        Boolean isAvailable
) {
}
