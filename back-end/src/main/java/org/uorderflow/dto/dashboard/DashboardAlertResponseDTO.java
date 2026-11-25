package org.uorderflow.dto.dashboard;

import java.time.LocalDateTime;

public record DashboardAlertResponseDTO(
        Long orderId,
        Integer tableNumber,
        String tableName,
        LocalDateTime deliveredAt,
        String message
) {
}
