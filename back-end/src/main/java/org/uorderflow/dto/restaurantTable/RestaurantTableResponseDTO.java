package org.uorderflow.dto.restaurantTable;

import org.uorderflow.model.RestaurantTable;

public record RestaurantTableResponseDTO(
        Long id,
        Integer number
) {
    public RestaurantTableResponseDTO(RestaurantTable restaurantTable){
        this(
                restaurantTable != null ? restaurantTable.getId() : null,
                restaurantTable != null ? restaurantTable.getNumber() : null
        );
    }
}
