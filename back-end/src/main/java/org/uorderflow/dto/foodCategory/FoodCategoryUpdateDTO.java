package org.uorderflow.dto.foodCategory;

import jakarta.validation.constraints.NotBlank;

public record FoodCategoryUpdateDTO(
        @NotBlank String name
) {
}
