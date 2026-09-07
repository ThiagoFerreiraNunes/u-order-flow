package org.uorderflow.dto.bill;

import org.uorderflow.model.Bill;
import org.uorderflow.utils.FormatUtils;

import java.math.BigDecimal;

public record BillSummaryResponseDTO(
        Long id,
        String customer,
        String status,
        String createdAt,
        Integer restaurantTable,
        String totalPrice
) {
    public BillSummaryResponseDTO(Bill bill){
        this(
                bill.getId(),
                bill.getCustomer(),
                bill.getStatus().name(),
                FormatUtils.formatDateTime(bill.getCreatedAt()),
                bill.getRestaurantTable().getNumber(),
                bill.getOrders() != null
                        ? FormatUtils.formatToBRL(bill.getOrders().stream()
                        .flatMap(order -> order.getItems().stream())
                        .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                        : FormatUtils.formatToBRL(BigDecimal.valueOf(0))
        );
    }
}
