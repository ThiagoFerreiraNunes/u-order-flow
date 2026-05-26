package org.uorderflow.service.foodCategory;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.uorderflow.exception.BusinessRuleException;
import org.uorderflow.model.FoodCategory;
import org.uorderflow.repository.FoodCategoryRepository;
import org.uorderflow.service.Action;

@Component
public class FoodCategoryValidation {
    @Autowired
    FoodCategoryRepository foodCategoryRepository;

    public FoodCategory validateFoodCategory(Long id, Action action){
        FoodCategory foodCategory = foodCategoryRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FoodCategory not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.FALSE.equals(foodCategory.getIsAvailable())){
                    throw new BusinessRuleException("FoodCategory not available with id " + id + ".");
                }
            }
            case DELETE -> {
                if(Boolean.FALSE.equals(foodCategory.getIsAvailable())){
                    throw new BusinessRuleException("FoodCategory is already not available with id " + id + ".");
                }
            }
            case REACTIVATE -> {
                if(Boolean.TRUE.equals(foodCategory.getIsAvailable())){
                    throw new BusinessRuleException("FoodCategory is already available with id " + id + ".");
                }
            }
        }
        return foodCategory;
    }
}
