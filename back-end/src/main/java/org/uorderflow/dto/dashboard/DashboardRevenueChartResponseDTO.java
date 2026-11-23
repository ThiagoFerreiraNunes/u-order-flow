package org.uorderflow.dto.dashboard;

import java.time.LocalDate;
import java.util.List;

public record DashboardRevenueChartResponseDTO(
        LocalDate startDate,
        LocalDate endDate,
        List<DashboardChartPointDTO> points
) {
}
