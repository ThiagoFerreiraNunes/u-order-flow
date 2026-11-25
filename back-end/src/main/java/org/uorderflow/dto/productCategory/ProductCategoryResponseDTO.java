package org.uorderflow.dto.productCategory;

import org.uorderflow.model.ProductCategory;

public record ProductCategoryResponseDTO(
        Long id,
        String name
) {
    public ProductCategoryResponseDTO(ProductCategory productCategory){
        this(productCategory.getId(), productCategory.getName());
    }
}
