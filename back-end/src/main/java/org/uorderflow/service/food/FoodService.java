package org.uorderflow.service.food;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uorderflow.dto.food.FoodCreateDTO;
import org.uorderflow.dto.food.FoodResponseDTO;
import org.uorderflow.dto.food.FoodUpdateDTO;
import org.uorderflow.model.Food;
import org.uorderflow.model.FoodCategory;
import org.uorderflow.repository.FoodRepository;
import org.uorderflow.service.Action;
import org.uorderflow.service.foodCategory.FoodCategoryValidation;

import java.util.List;

@Service
public class FoodService {

    @Autowired FoodRepository foodRepository;
    @Autowired FoodValidation foodValidation;
    @Autowired FoodCategoryValidation foodCategoryValidation;

    @Transactional
    public FoodResponseDTO create(FoodCreateDTO data){
        FoodCategory foodCategory = foodCategoryValidation.validadeFoodCategory(data.foodCategoryId(), Action.ACTIVE_CHECK);
        Food food = new Food(data, foodCategory);
        foodRepository.save(food);
        return new FoodResponseDTO(food);
    }

    public List<FoodResponseDTO> findAll(){
        return foodRepository.findAllByAvailableAndSortByName().stream().map(FoodResponseDTO::new).toList();
    }

    public FoodResponseDTO findById(Long id){
        Food food = foodValidation.validateFood(id, Action.ACTIVE_CHECK);
        return new FoodResponseDTO(food);
    }

    @Transactional
    public FoodResponseDTO update(Long id, FoodUpdateDTO data){
        FoodCategory foodCategory = null;
        if(data.foodCategoryId() != null){
            foodCategory = foodCategoryValidation.validadeFoodCategory(id, Action.ACTIVE_CHECK);
        }
        Food food = foodValidation.validateFood(id, Action.ACTIVE_CHECK);
        food.update(data, foodCategory);
        return new FoodResponseDTO(food);
    }

    @Transactional
    public void delete(Long id){
        Food food = foodValidation.validateFood(id, Action.DELETE);
        food.delete();
    }

    @Transactional
    public FoodResponseDTO reactivate(Long id){
        Food food = foodValidation.validateFood(id, Action.REACTIVATE);
        food.reactivate();
        return new FoodResponseDTO(food);
    }
}
