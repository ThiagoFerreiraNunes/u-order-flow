package org.uorderflow.dto.order;

import org.uorderflow.model.Order;
import org.uorderflow.utils.FormatUtils;

public record OrderSummaryResponseDTO(
        Long id,
        String status,
        String createdAt,
        String customer,
        String waiter,
        Integer restaurantTable
) {
    public OrderSummaryResponseDTO(Order order){
        this(
                order.getId(),
                order.getStatus().getDescription(),
                FormatUtils.formatDateTime(order.getCreatedAt()),
                order.getBill().getCustomer(),
                order.getWaiter().getName(),
                order.getBill().getRestaurantTable().getNumber()
        );
    }
}
