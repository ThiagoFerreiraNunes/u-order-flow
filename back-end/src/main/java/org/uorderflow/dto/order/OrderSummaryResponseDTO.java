package org.uorderflow.dto.order;

import org.uorderflow.dto.orderProduct.OrderProductResponseDTO;
import org.uorderflow.model.Order;
import org.uorderflow.utils.FormatUtils;

import java.util.List;

public record OrderSummaryResponseDTO(
        Long id,
        String createdAt,
        String customer,
        Integer restaurantTable,
        List<OrderProductResponseDTO> items
) {
    public OrderSummaryResponseDTO(Order order){
        this(
                order.getId(),
                FormatUtils.formatDateTime(order.getCreatedAt()),
                order.getBill().getCustomer(),
                order.getRestaurantTable().getNumber(),
                order.getItems().stream().map(OrderProductResponseDTO::new).toList()
        );
    }
}
