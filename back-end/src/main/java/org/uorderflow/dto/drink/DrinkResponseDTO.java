package org.uorderflow.dto.drink;

import org.uorderflow.dto.drinkCategory.DrinkCategoryResponseDTO;
import org.uorderflow.model.Drink;

public record DrinkResponseDTO(
        Long id,
        String name,
        String description,
        String image,
        Double price,
        DrinkCategoryResponseDTO drinkCategory
) {
    public DrinkResponseDTO(Drink drink){
        this(
                drink.getId(),
                drink.getName(),
                drink.getDescription(),
                drink.getImage(),
                drink.getPrice(),
                new DrinkCategoryResponseDTO(drink.getDrinkCategory())
        );
    }
}
