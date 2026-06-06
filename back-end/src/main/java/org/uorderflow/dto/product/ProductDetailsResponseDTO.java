package org.uorderflow.dto.product;

import org.uorderflow.dto.productCategory.ProductCategoryResponseDTO;
import org.uorderflow.model.Product;
import org.uorderflow.utils.FormatUtils;

public record ProductDetailsResponseDTO(
        Long id,
        String name,
        String description,
        String image,
        String price,
        ProductCategoryResponseDTO productCategory
) {
    public ProductDetailsResponseDTO(Product product){
        this(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getImage(),
                FormatUtils.formatToBRL(product.getPrice()),
                new ProductCategoryResponseDTO(product.getProductCategory())
        );
    }
}
