package org.uorderflow.dto.bill;

import org.uorderflow.dto.order.OrderSummaryResponseDTO;
import org.uorderflow.enums.bill.BillStatus;
import org.uorderflow.model.Bill;
import org.uorderflow.utils.FormatUtils;

import java.math.BigDecimal;
import java.util.List;

public record BillDetailsResponseDTO(
        Long id,
        String customer,
        String status,
        String createdAt,
        String paidAt,
        Integer restaurantTable,
        String totalPrice,
        List<OrderSummaryResponseDTO> orders
) {
    public BillDetailsResponseDTO(Bill bill){
        this(
                bill.getId(),
                bill.getCustomer(),
                bill.getStatus().name(),
                FormatUtils.formatDateTime(bill.getCreatedAt()),
                resolvePaidAt(bill),
                bill.getRestaurantTable().getNumber(),
                bill.getOrders() != null
                        ? FormatUtils.formatToBRL(bill.getOrders().stream()
                            .flatMap(order -> order.getItems().stream())
                            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add))
                        : FormatUtils.formatToBRL(BigDecimal.valueOf(0)),
                bill.getOrders() != null
                        ? bill.getOrders().stream().map(OrderSummaryResponseDTO::new).toList()
                        : List.of()
        );
    }

    private static String resolvePaidAt(Bill bill) {
        if (bill.getStatus() == BillStatus.PAID) {
            return FormatUtils.formatDateTime(bill.getPaidAt());
        }
        if (bill.getStatus() == BillStatus.CANCELLED) {
            return "Bill cancelled.";
        }

        return "Not paid yet.";

    }
}
