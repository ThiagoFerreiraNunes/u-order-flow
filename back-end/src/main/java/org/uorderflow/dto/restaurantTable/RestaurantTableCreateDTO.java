package org.uorderflow.dto.restaurantTable;

import jakarta.validation.constraints.NotNull;

public record RestaurantTableCreateDTO(
        @NotNull Integer number
) {
}
