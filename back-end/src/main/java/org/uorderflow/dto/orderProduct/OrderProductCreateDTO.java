package org.uorderflow.dto.orderProduct;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record OrderProductCreateDTO(
        @NotNull Long productId,
        @Size(max = 255) String note,
        @NotNull @Positive Integer quantity
) {
}
