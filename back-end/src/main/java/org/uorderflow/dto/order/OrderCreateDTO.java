package org.uorderflow.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.uorderflow.dto.orderProduct.OrderProductCreateDTO;

import java.util.List;

public record OrderCreateDTO(
        @NotBlank @Size(max = 100) String customer,
        @NotNull Long restaurantTableId,
        @NotEmpty List<OrderProductCreateDTO> items
) {
}
