package org.uorderflow.service;

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
        FoodCategory foodCategory = foodCategoryRepository.
                findById(id).orElseThrow(() -> new EntityNotFoundException("FoodCategory not found."));

        if(Boolean.FALSE.equals(foodCategory.getIsAvailable())){
            throw new BusinessRuleException("FoodCategory is not available with id " + foodCategory.getId());
        }

        return new FoodCategoryResponseDTO(foodCategory);
    }

    @Transactional
    public FoodCategoryResponseDTO update(Long id, FoodCategoryUpdateDTO data){
        FoodCategory foodCategory = foodCategoryRepository.
                findById(id).orElseThrow(() -> new EntityNotFoundException("FoodCategory not found."));

        if(Boolean.FALSE.equals(foodCategory.getIsAvailable())){
            throw new BusinessRuleException("FoodCategory is not available with id " + foodCategory.getId());
        }

        foodCategory.update(data);

        return new FoodCategoryResponseDTO(foodCategory);
    }

    @Transactional
    public void delete(Long id){
        FoodCategory foodCategory = foodCategoryRepository.
                findById(id).orElseThrow(() -> new EntityNotFoundException("FoodCategory not found."));

        if(Boolean.FALSE.equals(foodCategory.getIsAvailable())){
            throw new BusinessRuleException("FoodCategory is already not available with id " + foodCategory.getId());
        }
    }

    @Transactional
    public FoodCategoryResponseDTO reactivate(Long id){
        FoodCategory foodCategory = foodCategoryRepository.
                findById(id).orElseThrow(() -> new EntityNotFoundException("FoodCategory not found."));

        if(Boolean.TRUE.equals(foodCategory.getIsAvailable())){
            throw new BusinessRuleException("FoodCategory is already available with id " + foodCategory.getId());
        }

        return new FoodCategoryResponseDTO(foodCategory);
    }
}
