package org.uorderflow.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.uorderflow.dto.dashboard.DashboardRevenueChartResponseDTO;
import org.uorderflow.dto.dashboard.DashboardSummaryResponseDTO;
import org.uorderflow.service.dashboard.DashboardService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponseDTO> getSummary(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(dashboardService.getSummary(
                date == null ? LocalDate.now() : date
        ));
    }

    @GetMapping("/revenue-chart")
    public ResponseEntity<DashboardRevenueChartResponseDTO> getRevenueChart(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate referenceDate,
            @RequestParam(defaultValue = "7") int days
    ) {
        return ResponseEntity.ok(dashboardService.getRevenueChart(
                referenceDate == null ? LocalDate.now() : referenceDate,
                days
        ));
    }
}