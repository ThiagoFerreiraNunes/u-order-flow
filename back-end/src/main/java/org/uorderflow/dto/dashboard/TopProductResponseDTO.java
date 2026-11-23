package org.uorderflow.dto.dashboard;

import java.math.BigDecimal;

public record TopProductResponseDTO(
        Long productId,
        String productName,
        Long quantitySold,
        BigDecimal totalRevenue
) {
}