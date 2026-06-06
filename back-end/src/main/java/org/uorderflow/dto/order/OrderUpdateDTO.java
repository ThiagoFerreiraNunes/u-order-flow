package org.uorderflow.dto.order;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import org.uorderflow.dto.orderProduct.OrderProductCreateDTO;

import java.util.List;

public record OrderUpdateDTO(
        @Size(max = 100) String customer,
        Long restaurantTableId,
        @NotEmpty List<OrderProductCreateDTO> items
) {
}
