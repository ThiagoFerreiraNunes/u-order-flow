package org.uorderflow.dto.bill;

import jakarta.validation.constraints.Size;

public record BillUpdateDTO(
        @Size(max = 100) String customer,
        Long restaurantTableId
) {
}
