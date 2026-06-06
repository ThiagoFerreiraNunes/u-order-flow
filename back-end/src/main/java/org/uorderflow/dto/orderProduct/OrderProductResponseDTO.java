package org.uorderflow.dto.orderProduct;

import org.uorderflow.dto.product.ProductSummaryResponseDTO;
import org.uorderflow.model.OrderProduct;
import org.uorderflow.utils.FormatUtils;

public record OrderProductResponseDTO(
        ProductSummaryResponseDTO product,
        String note,
        Integer quantity,
        String unitPrice,
        String totalPrice
) {
    public OrderProductResponseDTO(OrderProduct orderProduct){
        this(
                new ProductSummaryResponseDTO(orderProduct.getProduct()),
                orderProduct.getNote(),
                orderProduct.getQuantity(),
                FormatUtils.formatToBRL(orderProduct.getUnitPrice()),
                FormatUtils.formatToBRL(orderProduct.getUnitPrice() * orderProduct.getQuantity())
        );
    }
}
