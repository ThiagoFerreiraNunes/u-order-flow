package org.uorderflow.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardChartPointDTO(
        LocalDate date,
        String dayOfWeek,
        BigDecimal revenue
) {
}

