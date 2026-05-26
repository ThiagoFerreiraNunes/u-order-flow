package org.uorderflow.service.drink;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uorderflow.dto.drink.DrinkCreateDTO;
import org.uorderflow.dto.drink.DrinkResponseDTO;
import org.uorderflow.dto.drink.DrinkUpdateDTO;
import org.uorderflow.model.Drink;
import org.uorderflow.model.DrinkCategory;
import org.uorderflow.repository.DrinkRepository;
import org.uorderflow.service.Action;
import org.uorderflow.service.drinkCategory.DrinkCategoryValidation;

import java.util.List;

@Service
public class DrinkService {

    @Autowired DrinkRepository drinkRepository;
    @Autowired DrinkValidation drinkValidation;
    @Autowired DrinkCategoryValidation drinkCategoryValidation;

    @Transactional
    public DrinkResponseDTO create(DrinkCreateDTO data){
        DrinkCategory drinkCategory = drinkCategoryValidation.validadeDrinkCategory(data.drinkCategoryId(), Action.ACTIVE_CHECK);
        Drink drink = new Drink(data, drinkCategory);
        drinkRepository.save(drink);
        return new DrinkResponseDTO(drink);
    }

    public List<DrinkResponseDTO> findAll(){
        return drinkRepository.findAllByAvailableAndSortByName().stream().map(DrinkResponseDTO::new).toList();
    }

    public DrinkResponseDTO findById(Long id){
        Drink drink = drinkValidation.validateDrink(id, Action.ACTIVE_CHECK);
        return new DrinkResponseDTO(drink);
    }

    @Transactional
    public DrinkResponseDTO update(Long id, DrinkUpdateDTO data){
        DrinkCategory drinkCategory = null;
        if(data.drinkCategoryId() != null){
            drinkCategory = drinkCategoryValidation.validadeDrinkCategory(data.drinkCategoryId(), Action.ACTIVE_CHECK);
        }
        
        Drink drink = drinkValidation.validateDrink(id, Action.ACTIVE_CHECK);
        drink.update(data, drinkCategory);
        return new DrinkResponseDTO(drink);
    }

    @Transactional
    public void delete(Long id){
        Drink drink = drinkValidation.validateDrink(id, Action.DELETE);
        drink.delete();
    }

    @Transactional
    public DrinkResponseDTO reactivate(Long id){
        Drink drink = drinkValidation.validateDrink(id, Action.REACTIVATE);
        drink.reactivate();
        return new DrinkResponseDTO(drink);
    }
}
