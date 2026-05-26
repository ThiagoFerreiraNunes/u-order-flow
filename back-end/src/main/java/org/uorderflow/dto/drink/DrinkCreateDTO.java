package org.uorderflow.dto.drink;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DrinkCreateDTO(
        @NotBlank String name,
        @NotBlank String description,
        @NotBlank String image,
        @NotNull Double price,
        @NotNull Long drinkCategoryId
) {
}
