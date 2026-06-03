package org.uorderflow.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ProductCreateDTO(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 255) String description,
        @NotBlank @Size(max = 2048) String image,
        @NotNull @Positive Double price,
        @NotNull Long productCategoryId
) {
}
