package org.uorderflow.dto.product;

public record ProductUpdateDTO(
        String name,
        String description,
        String image,
        Double price,
        Long productCategoryId
) {
}
