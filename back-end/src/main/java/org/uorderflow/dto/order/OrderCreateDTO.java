package org.uorderflow.dto.order;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.uorderflow.dto.orderProduct.OrderProductCreateDTO;

import java.util.List;

public record OrderCreateDTO(
        @NotNull Long restaurantTableId,
        @NotEmpty List<OrderProductCreateDTO> items
) {
}
