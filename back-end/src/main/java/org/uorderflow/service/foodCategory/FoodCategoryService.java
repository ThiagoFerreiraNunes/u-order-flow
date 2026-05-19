package org.uorderflow.service.foodCategory;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uorderflow.dto.foodCategory.FoodCategoryCreateDTO;
import org.uorderflow.dto.foodCategory.FoodCategoryResponseDTO;
import org.uorderflow.dto.foodCategory.FoodCategoryUpdateDTO;
import org.uorderflow.exception.BusinessRuleException;
import org.uorderflow.model.FoodCategory;
import org.uorderflow.repository.FoodCategoryRepository;

import java.util.List;

@Service
public class FoodCategoryService {

    @Autowired FoodCategoryRepository foodCategoryRepository;
    @Autowired FoodCategoryValidation foodCategoryValidation;

    @Transactional
    public FoodCategoryResponseDTO create(FoodCategoryCreateDTO data){
        FoodCategory foodCategory = new FoodCategory(data);
        foodCategoryRepository.save(foodCategory);
        return new FoodCategoryResponseDTO(foodCategory);
    }

    public List<FoodCategoryResponseDTO> findAll(){
        return foodCategoryRepository.findAllByAvailableAndSortByName().stream().map(FoodCategoryResponseDTO::new).toList();
    }

    public FoodCategoryResponseDTO findById(Long id){
        FoodCategory foodCategory = foodCategoryValidation.validadeFoodCategory(id, FoodCategoryAction.ACTIVE_CHECK);
        return new FoodCategoryResponseDTO(foodCategory);
    }

    @Transactional
    public FoodCategoryResponseDTO update(Long id, FoodCategoryUpdateDTO data){
        FoodCategory foodCategory = foodCategoryValidation.validadeFoodCategory(id, FoodCategoryAction.ACTIVE_CHECK);
        foodCategory.update(data);
        return new FoodCategoryResponseDTO(foodCategory);
    }

    @Transactional
    public void delete(Long id){
        FoodCategory foodCategory = foodCategoryValidation.validadeFoodCategory(id, FoodCategoryAction.DELETE);
        foodCategory.delete();
    }

    @Transactional
    public FoodCategoryResponseDTO reactivate(Long id){
        FoodCategory foodCategory = foodCategoryValidation.validadeFoodCategory(id, FoodCategoryAction.REACTIVATE);
        foodCategory.reactivate();
        return new FoodCategoryResponseDTO(foodCategory);
    }
}
