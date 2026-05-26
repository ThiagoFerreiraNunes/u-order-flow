package org.uorderflow.dto.food;

import org.uorderflow.dto.productCategory.ProductCategoryResponseDTO;
import org.uorderflow.model.Food;

public record FoodResponseDTO(
        Long id,
        String name,
        String description,
        String image,
        Double price,
        ProductCategoryResponseDTO foodCategory
) {
    public FoodResponseDTO(Food food){
        this(
                food.getId(),
                food.getName(),
                food.getDescription(),
                food.getImage(),
                food.getPrice(),
                new ProductCategoryResponseDTO(food.getFoodCategory())
        );
    }
}
