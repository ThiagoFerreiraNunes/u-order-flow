package org.uorderflow.dto.foodCategory;

import org.uorderflow.model.FoodCategory;

public record FoodCategoryResponseDTO(
        Long id,
        String name
) {
    public FoodCategoryResponseDTO(FoodCategory foodCategory){
        this(foodCategory.getId(), foodCategory.getName());
    }
}
