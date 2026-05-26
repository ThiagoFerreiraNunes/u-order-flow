package org.uorderflow.dto.drink;

public record DrinkUpdateDTO(
        String name,
        String description,
        String image,
        Double price,
        Long drinkCategoryId
) {
}
