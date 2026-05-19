package org.uorderflow.dto.drinkCategory;

import jakarta.validation.constraints.NotBlank;

public record DrinkCategoryCreateDTO(
        @NotBlank String name
) {
}
