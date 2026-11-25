package org.uorderflow.dto.productCategory;

import jakarta.validation.constraints.Size;

public record ProductCategoryUpdateDTO(
        @Size(max = 50) String name
) {
}
