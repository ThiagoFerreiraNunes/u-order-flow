package org.uorderflow.dto.order;

import org.uorderflow.dto.orderProduct.OrderProductResponseDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableResponseDTO;
import org.uorderflow.dto.user.UserResponseDTO;
import org.uorderflow.enums.order.OrderStatus;
import org.uorderflow.model.Order;
import org.uorderflow.utils.FormatUtils;

import java.math.BigDecimal;
import java.util.List;

public record OrderDetailsResponseDTO(
        Long id,
        String status,
        String createdAt,
        String deliveredAt,
        String customer,
        UserResponseDTO employee,
        RestaurantTableResponseDTO restaurantTable,
        String totalPrice,
        List<OrderProductResponseDTO> items
) {
    public OrderDetailsResponseDTO(Order order){
        this(
                order.getId(),
                order.getStatus().getDescription(),
                FormatUtils.formatDateTime(order.getCreatedAt()),
                resolveDeliveredAt(order),
                order.getBill().getCustomer(),
                new UserResponseDTO(order.getEmployee()),
                new RestaurantTableResponseDTO(order.getBill().getRestaurantTable()),
                FormatUtils.formatToBRL(order.getItems().stream()
                        .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)),
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
