package org.uorderflow.dto.bill;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BillUpdateDTO(
        @NotBlank @Size(max = 100) String customer,
        @NotNull Long restaurantTableId
) {
}
