package org.uorderflow.dto.restaurantTable;

import jakarta.validation.constraints.Positive;

public record RestaurantTableUpdateDTO(
        @Positive Integer number
) {
}
