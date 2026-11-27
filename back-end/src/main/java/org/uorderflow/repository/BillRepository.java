package org.uorderflow.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.enums.bill.BillStatus;
import org.uorderflow.model.Bill;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {

    @Query(value = "SELECT b FROM Bill b " +
            "LEFT JOIN FETCH b.restaurantTable",
            countQuery = "SELECT count(b) FROM Bill b")
    Page<Bill> findAllPaged(Pageable pageable);

    @Query(
            value = "SELECT b FROM Bill b " +
                    "LEFT JOIN FETCH b.restaurantTable " +
                    "WHERE b.createdAt BETWEEN :startOfDay AND :endOfDay",
            countQuery = "SELECT COUNT(b) FROM Bill b " +
                    "WHERE b.createdAt BETWEEN :startOfDay AND :endOfDay"
    )
    Page<Bill> findAllPagedByDate(
            @Param("startOfDay")LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            Pageable pageable
    );

    @Query("SELECT DISTINCT b FROM Bill b " +
            "LEFT JOIN FETCH b.restaurantTable " +
            "LEFT JOIN FETCH b.orders " +
            "WHERE b.id = :id")
    Optional<Bill> findByIdWithDetails(@Param("id") Long id);

    @Query("""
        SELECT SUM(i.unitPrice * i.quantity)
        FROM OrderProduct i
        WHERE i.order.bill.status = PAID
        AND i.order.bill.paidAt >= :startInclusive
        AND i.order.bill.paidAt < :endExclusive
    """)
    BigDecimal sumPaidItemRevenueBetween(
            @Param("startInclusive") LocalDateTime startInclusive,
            @Param("endExclusive") LocalDateTime endExclusive
    );

    @Query("""
        SELECT COUNT(b)
        FROM Bill b
        WHERE b.status = PAID
        AND b.paidAt >= :startInclusive
        AND b.paidAt < :endExclusive
    """)
    long countPaidBetween(
            @Param("startInclusive") LocalDateTime startInclusive,
            @Param("endExclusive") LocalDateTime endExclusive
    );

    @Query("""
        SELECT CAST(op.order.bill.paidAt AS LocalDate) AS date,
           SUM(op.unitPrice * op.quantity) AS revenue
        FROM OrderProduct op
        WHERE op.order.bill.status = PAID
        AND op.order.bill.paidAt >= :startInclusive
        AND op.order.bill.paidAt < :endExclusive
        GROUP BY CAST(op.order.bill.paidAt AS LocalDate)
        ORDER BY date ASC
    """)
    List<DailyRevenueProjection> findDailyPaidRevenueBetween(
            @Param("startInclusive") LocalDateTime startInclusive,
            @Param("endExclusive") LocalDateTime endExclusive
    );

    boolean existsByRestaurantTableIdAndStatus(Long restaurantTableId, BillStatus status);

    interface DailyRevenueProjection {
        LocalDate getDate();
        BigDecimal getRevenue();
    }
}
