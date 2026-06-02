package org.uorderflow.dto.restaurantTable;

import jakarta.validation.constraints.NotNull;

public record RestaurantTableUpdateDTO(
        @NotNull Integer number
) {
}
