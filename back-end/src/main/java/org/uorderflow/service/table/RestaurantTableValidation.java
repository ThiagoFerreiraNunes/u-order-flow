package org.uorderflow.service.table;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.uorderflow.exception.BusinessRuleException;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.RestaurantTableRepository;
import org.uorderflow.enums.ValidateAction;

@Component
public class RestaurantTableValidation {

    @Autowired RestaurantTableRepository restaurantTableRepository;

    public RestaurantTable validateRestaurantTable(Long id, ValidateAction action) {
        RestaurantTable restaurantTable = restaurantTableRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RestaurantTable not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.FALSE.equals(restaurantTable.getIsAvailable())){
                    throw new BusinessRuleException("RestaurantTable not available with id " + id + ".");
                }
            }
            case DELETE -> {
                if(Boolean.FALSE.equals(restaurantTable.getIsAvailable())){
                    throw new BusinessRuleException("RestaurantTable is already not available with id " + id + ".");
                }
            }
            case REACTIVATE -> {
                if(Boolean.TRUE.equals(restaurantTable.getIsAvailable())){
                    throw new BusinessRuleException("RestaurantTable is already available with id " + id + ".");
                }
            }
        }
        return restaurantTable;
    }
}
