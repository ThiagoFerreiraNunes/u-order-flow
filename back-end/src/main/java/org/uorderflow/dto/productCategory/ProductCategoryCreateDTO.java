package org.uorderflow.dto.productCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductCategoryCreateDTO(
        @NotBlank @Size(max = 50) String name
) {
}
