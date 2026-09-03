package org.uorderflow.dto.bill;

import org.uorderflow.model.Bill;
import org.uorderflow.utils.FormatUtils;

public record BillSummaryResponseDTO(
        Long id,
        String customer,
        String status,
        String createdAt,
        Integer restaurantTable
) {
    public BillSummaryResponseDTO(Bill bill){
        this(
                bill.getId(),
                bill.getCustomer(),
                bill.getStatus().name(),
                FormatUtils.formatDateTime(bill.getCreatedAt()),
                bill.getRestaurantTable().getNumber()
        );
    }
}
