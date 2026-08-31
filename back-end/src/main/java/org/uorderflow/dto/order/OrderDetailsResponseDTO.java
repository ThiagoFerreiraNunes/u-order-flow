package org.uorderflow.dto.order;

import org.uorderflow.dto.orderProduct.OrderProductResponseDTO;
import org.uorderflow.enums.OrderStatus;
import org.uorderflow.model.Order;
import org.uorderflow.utils.FormatUtils;

import java.util.List;

public record OrderDetailsResponseDTO(
        Long id,
        String status,
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
                FormatUtils.formatDateTime(order.getCreatedAt()),
                resolveDeliveredAt(order),
                order.getBill().getCustomer(),
                order.getRestaurantTable().getNumber(),
                order.getItems().stream().map(OrderProductResponseDTO::new).toList()
        );
    }

    private static String resolveDeliveredAt(Order order) {
        if (order.getStatus() == OrderStatus.DELIVERED) {
            return FormatUtils.formatDateTime(order.getDeliveredAt());
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return "Order cancelled.";
        }

        return "Not delivered yet.";
    }
}
