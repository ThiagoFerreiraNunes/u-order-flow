package org.uorderflow.dto.food;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FoodCreateDTO(
        @NotBlank String name,
        @NotBlank String description,
        @NotBlank String image,
        @NotNull Double price,
        @NotNull Long foodCategoryId
) {
}
