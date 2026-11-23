package org.uorderflow.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DashboardSummaryResponseDTO(
        LocalDate date,
        long totalOrders,
        BigDecimal totalRevenue,
        BigDecimal averageTicket,
        List<TopProductResponseDTO> topProducts,
        List<DashboardAlertResponseDTO> recentAlerts
) {
}