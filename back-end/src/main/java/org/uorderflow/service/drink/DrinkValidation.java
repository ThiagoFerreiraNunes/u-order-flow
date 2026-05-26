package org.uorderflow.service.drink;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.uorderflow.exception.BusinessRuleException;
import org.uorderflow.model.Drink;
import org.uorderflow.repository.DrinkRepository;
import org.uorderflow.service.Action;

@Component
public class DrinkValidation {

    @Autowired DrinkRepository drinkRepository;

    public Drink validateDrink(Long id, Action action){
        Drink drink = drinkRepository
                .findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Drink not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.FALSE.equals(drink.getIsAvailable())){
                    throw new BusinessRuleException("Drink not available with id " + id + ".");
                }
            }
            case DELETE -> {
                if(Boolean.FALSE.equals(drink.getIsAvailable())){
                    throw new BusinessRuleException("Drink is already not available with id " + id + ".");
                }
            }
            case REACTIVATE -> {
                if(Boolean.TRUE.equals(drink.getIsAvailable())){
                    throw new BusinessRuleException("Drink is already available with id " + id + ".");
                }
            }
        }
        return drink;
    }
}
