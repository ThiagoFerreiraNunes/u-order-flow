package org.uorderflow.dto.product;

import org.uorderflow.model.Product;
import org.uorderflow.utils.FormatUtils;

public record ProductSummaryResponseDTO(
        Long id,
        String name,
        String price,
        String image,
        String productCategory,
        Boolean isAvailable
) {
    public ProductSummaryResponseDTO(Product product){
        this(
                product.getId(),
                product.getName(),
                FormatUtils.formatToBRL(product.getPrice()),
                product.getImage(),
                product.getProductCategory().getName(),
                product.getIsAvailable()
        );
    }
}
