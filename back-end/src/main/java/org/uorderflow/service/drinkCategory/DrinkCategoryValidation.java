package org.uorderflow.service.drinkCategory;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.uorderflow.exception.BusinessRuleException;
import org.uorderflow.model.DrinkCategory;
import org.uorderflow.repository.DrinkCategoryRepository;
import org.uorderflow.service.Action;

@Component
public class DrinkCategoryValidation {
    @Autowired
    DrinkCategoryRepository drinkCategoryRepository;

    public DrinkCategory validadeDrinkCategory(Long id, Action action){
        DrinkCategory drinkCategory = drinkCategoryRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("DrinkCategory not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.FALSE.equals(drinkCategory.getIsAvailable())){
                    throw new BusinessRuleException("DrinkCategory not available with id " + id + ".");
                }
            }
            case DELETE -> {
                if(Boolean.FALSE.equals(drinkCategory.getIsAvailable())){
                    throw new BusinessRuleException("DrinkCategory is already not available with id " + id + ".");
                }
            }
            case REACTIVATE -> {
                if(Boolean.TRUE.equals(drinkCategory.getIsAvailable())){
                    throw new BusinessRuleException("DrinkCategory is already available with id " + id + ".");
                }
            }
        }
        return drinkCategory;
    }
}
