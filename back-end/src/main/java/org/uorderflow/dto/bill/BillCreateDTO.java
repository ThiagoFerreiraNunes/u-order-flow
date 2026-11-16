package org.uorderflow.dto.bill;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BillCreateDTO(
        @NotBlank @Size(max = 100) String customer,
        Long restaurantTableId
) {
}
