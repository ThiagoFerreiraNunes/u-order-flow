package org.uorderflow.service.dashboard;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.dashboard.DashboardAlertResponseDTO;
import org.uorderflow.dto.dashboard.DashboardChartPointDTO;
import org.uorderflow.dto.dashboard.DashboardRevenueChartResponseDTO;
import org.uorderflow.dto.dashboard.DashboardSummaryResponseDTO;
import org.uorderflow.dto.dashboard.TopProductResponseDTO;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.repository.BillRepository;
import org.uorderflow.repository.OrderRepository;
import org.uorderflow.repository.ProductRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final BigDecimal ZERO_MONEY = BigDecimal.ZERO.setScale(2);
    private static final int RECENT_ALERT_LIMIT = 5;

    private final BillRepository billRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Value("${dashboard.top-products.limit:5}")
    private int topProductsLimit = 5;

    public DashboardService(
            BillRepository billRepository,
            OrderRepository orderRepository,
            ProductRepository productRepository
    ) {
        this.billRepository = billRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponseDTO getSummary(LocalDate date) {
        LocalDateTime startInclusive = date.atStartOfDay();
        LocalDateTime endExclusive = date.plusDays(1).atStartOfDay();

        BigDecimal revenue = moneyOrZero(
                billRepository.sumPaidItemRevenueBetween(startInclusive, endExclusive)
        );
        long paidBills = billRepository.countPaidBetween(startInclusive, endExclusive);
        BigDecimal averageTicket = paidBills == 0
                ? ZERO_MONEY
                : revenue.divide(BigDecimal.valueOf(paidBills), 2, RoundingMode.HALF_UP);

        List<TopProductResponseDTO> topProducts = productRepository.findTopProductsSoldBetween(
                        startInclusive,
                        endExclusive,
                        PageRequest.of(0, topProductsLimit)
                ).stream()
                .map(product -> new TopProductResponseDTO(
                        product.getProductId(),
                        product.getProductName(),
                        product.getQuantitySold(),
                        moneyOrZero(product.getTotalRevenue())
                ))
                .toList();

        List<DashboardAlertResponseDTO> recentAlerts = orderRepository
                .findRecentDeliveredAlerts(PageRequest.of(0, RECENT_ALERT_LIMIT))
                .stream()
                .map(alert -> new DashboardAlertResponseDTO(
                        alert.getOrderId(),
                        alert.getTableNumber(),
                        String.format(Locale.ROOT, "Mesa %02d", alert.getTableNumber()),
                        alert.getDeliveredAt(),
                        String.format(Locale.ROOT, "Pedido #%04d finalizado", alert.getOrderId())
                ))
                .toList();

        return new DashboardSummaryResponseDTO(
                date,
                orderRepository.countCreatedBetween(startInclusive, endExclusive),
                revenue,
                averageTicket,
                topProducts,
                recentAlerts
        );
    }

    @Transactional(readOnly = true)
    public DashboardRevenueChartResponseDTO getRevenueChart(LocalDate referenceDate, int days) {
        if (days < 7 || days > 30) {
            throw new BusinessRuleException("The number of chart days must be between 7 and 30.");
        }

        LocalDate startDate = referenceDate.minusDays(days - 1L);
        LocalDateTime startInclusive = startDate.atStartOfDay();
        LocalDateTime endExclusive = referenceDate.plusDays(1).atStartOfDay();

        Map<LocalDate, BigDecimal> revenueByDate = billRepository.findDailyPaidRevenueBetween(
                        startInclusive, endExclusive
                ).stream()
                .collect(Collectors.toMap(
                        BillRepository.DailyRevenueProjection::getDate,
                        projection -> moneyOrZero(projection.getRevenue())
                ));

        List<DashboardChartPointDTO> points = startDate.datesUntil(referenceDate.plusDays(1))
                .map(date -> new DashboardChartPointDTO(
                        date,
                        dayOfWeekAbbreviation(date.getDayOfWeek()),
                        revenueByDate.getOrDefault(date, ZERO_MONEY)
                ))
                .toList();

        return new DashboardRevenueChartResponseDTO(startDate, referenceDate, points);
    }

    private static BigDecimal moneyOrZero(BigDecimal value) {
        return value == null ? ZERO_MONEY : value.setScale(2, RoundingMode.HALF_UP);
    }

    private static String dayOfWeekAbbreviation(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "SEG";
            case TUESDAY -> "TER";
            case WEDNESDAY -> "QUA";
            case THURSDAY -> "QUI";
            case FRIDAY -> "SEX";
            case SATURDAY -> "SÁB";
            case SUNDAY -> "DOM";
        };
    }
}
