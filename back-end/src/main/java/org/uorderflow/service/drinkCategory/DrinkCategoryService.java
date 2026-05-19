package org.uorderflow.service.drinkCategory;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uorderflow.dto.drinkCategory.DrinkCategoryCreateDTO;
import org.uorderflow.dto.drinkCategory.DrinkCategoryResponseDTO;
import org.uorderflow.dto.drinkCategory.DrinkCategoryUpdateDTO;
import org.uorderflow.model.DrinkCategory;
import org.uorderflow.repository.DrinkCategoryRepository;
import org.uorderflow.service.Action;

import java.util.List;

@Service
public class DrinkCategoryService {

    @Autowired DrinkCategoryRepository drinkCategoryRepository;
    @Autowired DrinkCategoryValidation drinkCategoryValidation;

    @Transactional
    public DrinkCategoryResponseDTO create(DrinkCategoryCreateDTO data){
        DrinkCategory drinkCategory = new DrinkCategory(data);
        drinkCategoryRepository.save(drinkCategory);
        return new DrinkCategoryResponseDTO(drinkCategory);
    }

    public List<DrinkCategoryResponseDTO> findAll(){
        return drinkCategoryRepository.findAllByAvailableAndSortByName().stream().map(DrinkCategoryResponseDTO::new).toList();
    }

    public DrinkCategoryResponseDTO findById(Long id){
        DrinkCategory drinkCategory = drinkCategoryValidation.validadeDrinkCategory(id, Action.ACTIVE_CHECK);
        return new DrinkCategoryResponseDTO(drinkCategory);
    }

    @Transactional
    public DrinkCategoryResponseDTO update(Long id, DrinkCategoryUpdateDTO data){
        DrinkCategory drinkCategory = drinkCategoryValidation.validadeDrinkCategory(id, Action.ACTIVE_CHECK);
        drinkCategory.update(data);
        return new DrinkCategoryResponseDTO(drinkCategory);
    }

    @Transactional
    public void delete(Long id){
        DrinkCategory drinkCategory = drinkCategoryValidation.validadeDrinkCategory(id, Action.DELETE);
        drinkCategory.delete();
    }

    @Transactional
    public DrinkCategoryResponseDTO reactivate(Long id){
        DrinkCategory drinkCategory = drinkCategoryValidation.validadeDrinkCategory(id, Action.REACTIVATE);
        drinkCategory.reactivate();
        return new DrinkCategoryResponseDTO(drinkCategory);
    }
}
