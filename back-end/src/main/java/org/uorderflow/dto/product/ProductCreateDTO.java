package org.uorderflow.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductCreateDTO(
        @NotBlank String name,
        @NotBlank String description,
        @NotBlank String image,
        @NotNull Double price,
        @NotNull Long productCategoryId
) {
}
