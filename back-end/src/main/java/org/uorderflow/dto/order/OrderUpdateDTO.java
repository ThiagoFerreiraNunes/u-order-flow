package org.uorderflow.dto.order;

import jakarta.validation.constraints.NotEmpty;
import org.uorderflow.dto.orderProduct.OrderProductCreateDTO;

import java.util.List;

public record OrderUpdateDTO(
        Long waiterId,
        @NotEmpty List<OrderProductCreateDTO> items
) {
}
