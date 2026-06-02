package org.uorderflow.dto.restaurantTable;

import org.uorderflow.model.RestaurantTable;

public record RestaurantTableResponseDTO(
        Long id,
        Integer number
) {
    public RestaurantTableResponseDTO(RestaurantTable restaurantTable){
        this(restaurantTable.getId(), restaurantTable.getNumber());
    }
}
