package org.uorderflow.dto.food;

public record FoodUpdateDTO(
        String name,
        String description,
        String image,
        Double price,
        Long foodCategoryId
) {
}
