package org.uorderflow.dto.order;

import org.uorderflow.model.Order;
import org.uorderflow.utils.FormatUtils;

import java.math.BigDecimal;

public record OrderSummaryResponseDTO(
        Long id,
        String status,
        String createdAt,
        String customer,
        String employee,
        Integer restaurantTable,
        String totalPrice
) {
    public OrderSummaryResponseDTO(Order order){
        this(
                order.getId(),
                order.getStatus().getDescription(),
                FormatUtils.formatDateTime(order.getCreatedAt()),
                order.getBill().getCustomer(),
                order.getEmployee().getName(),
                order.getBill().getRestaurantTable().getNumber(),
                FormatUtils.formatToBRL(order.getItems().stream()
                        .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
        );
    }
}
