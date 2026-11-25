package org.uorderflow.service.restaurantTable;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.RestaurantTableRepository;

@Component
public class RestaurantTableValidation {

    private final RestaurantTableRepository restaurantTableRepository;

    public RestaurantTableValidation(RestaurantTableRepository restaurantTableRepository) {
        this.restaurantTableRepository = restaurantTableRepository;
    }

    public RestaurantTable validateRestaurantTable(Long id) {
        RestaurantTable restaurantTable = restaurantTableRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RestaurantTable not found with id " + id + "."));

        return restaurantTable;
    }
}
