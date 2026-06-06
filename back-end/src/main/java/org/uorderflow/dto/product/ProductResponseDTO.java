package org.uorderflow.dto.product;

import org.uorderflow.dto.productCategory.ProductCategoryResponseDTO;
import org.uorderflow.model.Product;

public record ProductResponseDTO(
        Long id,
        String name,
        String description,
        String image,
        Double price,
        ProductCategoryResponseDTO productCategory
) {
    public ProductResponseDTO(Product product){
        this(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getImage(),
                product.getPrice(),
                new ProductCategoryResponseDTO(product.getProductCategory())
        );
    }
}
