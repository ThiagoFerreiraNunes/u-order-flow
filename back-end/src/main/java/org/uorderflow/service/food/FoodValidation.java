package org.uorderflow.service.food;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.uorderflow.exception.BusinessRuleException;
import org.uorderflow.model.Food;
import org.uorderflow.repository.FoodRepository;
import org.uorderflow.service.Action;

@Component
public class FoodValidation {

    @Autowired FoodRepository foodRepository;

    public Food validateFood(Long id, Action action){
        Food food = foodRepository
                .findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Food not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.FALSE.equals(food.getIsAvailable())){
                    throw new BusinessRuleException("Food not available with id " + id + ".");
                }
            }
            case DELETE -> {
                if(Boolean.FALSE.equals(food.getIsAvailable())){
                    throw new BusinessRuleException("Food is already not available with id " + id + ".");
                }
            }
            case REACTIVATE -> {
                if(Boolean.TRUE.equals(food.getIsAvailable())){
                    throw new BusinessRuleException("Food is already available with id " + id + ".");
                }
            }
        }
        return food;
    }
}
