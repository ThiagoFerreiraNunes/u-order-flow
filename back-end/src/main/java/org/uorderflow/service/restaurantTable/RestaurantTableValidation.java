package org.uorderflow.service.restaurantTable;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.RestaurantTableRepository;
import org.uorderflow.enums.generic.ValidateAction;

@Component
public class RestaurantTableValidation {

    private final RestaurantTableRepository restaurantTableRepository;

    public RestaurantTableValidation(RestaurantTableRepository restaurantTableRepository) {
        this.restaurantTableRepository = restaurantTableRepository;
    }

    public RestaurantTable validateRestaurantTable(Long id, ValidateAction action) {
        RestaurantTable restaurantTable = restaurantTableRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RestaurantTable not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.TRUE.equals(restaurantTable.getIsDeleted())){
                    throw new BusinessRuleException("RestaurantTable is deleted with id " + id + ".");
                }
            }
            case DELETE -> {
                if(Boolean.TRUE.equals(restaurantTable.getIsDeleted())){
                    throw new BusinessRuleException("RestaurantTable is already deleted with id " + id + ".");
                }
            }
            case REACTIVATE -> {
                if(Boolean.FALSE.equals(restaurantTable.getIsDeleted())){
                    throw new BusinessRuleException("RestaurantTable is already activated with id " + id + ".");
                }
            }
        }
        return restaurantTable;
    }

    public void validateUniqueFields(int number){
        if(restaurantTableRepository.existsByNumber(number)){
            throw new BusinessRuleException("A RestaurantTable with the number '" + number + "' already exists");
        }
    }
}
