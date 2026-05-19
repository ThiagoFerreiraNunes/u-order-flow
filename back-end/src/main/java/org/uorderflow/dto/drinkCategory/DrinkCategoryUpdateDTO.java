package org.uorderflow.dto.drinkCategory;

import jakarta.validation.constraints.NotBlank;

public record DrinkCategoryUpdateDTO(
        @NotBlank String name
) {
}
