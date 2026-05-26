package org.uorderflow.dto.productCategory;

import jakarta.validation.constraints.NotBlank;

public record ProductCategoryCreateDTO(
        @NotBlank String name
) {
}
