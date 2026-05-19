package org.uorderflow.dto.drinkCategory;

import org.uorderflow.model.DrinkCategory;

public record DrinkCategoryResponseDTO(
        Long id,
        String name
) {
    public DrinkCategoryResponseDTO(DrinkCategory drinkCategory){
        this(drinkCategory.getId(), drinkCategory.getName());
    }
}
