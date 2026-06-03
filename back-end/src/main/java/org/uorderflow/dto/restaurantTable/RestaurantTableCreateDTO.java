package org.uorderflow.dto.restaurantTable;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RestaurantTableCreateDTO(
        @NotNull @Positive Integer number
) {
}
