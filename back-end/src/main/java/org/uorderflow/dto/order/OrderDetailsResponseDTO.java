package org.uorderflow.dto.order;

import org.uorderflow.dto.orderProduct.OrderProductResponseDTO;
import org.uorderflow.model.Order;
import org.uorderflow.utils.FormatUtils;

import java.time.LocalDateTime;
import java.util.List;

public record OrderDetailsResponseDTO(
        Long id,
        String status,
        Boolean isPaid,
        Boolean cancellationFee,
        String createdAt,
        String deliveredAt,
        String customer,
        Integer restaurantTable,
        List<OrderProductResponseDTO> items
) {
    public OrderDetailsResponseDTO(Order order){
        this(
                order.getId(),
                order.getStatus().getDescription(),
                order.getIsPaid(),
                order.getCancellationFee(),
                FormatUtils.formatDateTime(order.getCreatedAt()),
                FormatUtils.formatDateTime(order.getDeliveredAt()),
                order.getCustomer(),
                order.getRestaurantTable().getNumber(),
                order.getItems().stream().map(OrderProductResponseDTO::new).toList()
        );
    }
}
