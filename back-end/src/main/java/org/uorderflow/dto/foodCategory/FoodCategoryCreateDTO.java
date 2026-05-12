package org.uorderflow.dto.foodCategory;

import jakarta.validation.constraints.NotBlank;

public record FoodCategoryCreateDTO(
        @NotBlank String name
) {
}
