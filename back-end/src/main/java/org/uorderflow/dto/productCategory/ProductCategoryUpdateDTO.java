package org.uorderflow.dto.productCategory;

import jakarta.validation.constraints.NotBlank;

public record ProductCategoryUpdateDTO(
        @NotBlank String name
) {
}
