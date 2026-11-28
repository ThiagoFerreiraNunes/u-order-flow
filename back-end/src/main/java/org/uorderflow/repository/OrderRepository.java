package org.uorderflow.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query(value = "SELECT o FROM Order o " +
            "JOIN FETCH o.employee " +
            "JOIN FETCH o.bill b " +
            "LEFT JOIN FETCH b.restaurantTable ",
            countQuery = "SELECT count(o) FROM Order o")
    Page<Order> findAllPaged(Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o " +
            "JOIN FETCH o.employee " +
            "JOIN FETCH o.bill b " +
            "LEFT JOIN FETCH b.restaurantTable " +
            "JOIN FETCH o.items " +
            "WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT COUNT(o) FROM Order o " +
            "WHERE o.createdAt >= :startInclusive AND o.createdAt < :endExclusive")
    long countCreatedBetween(
            @Param("startInclusive") LocalDateTime startInclusive,
            @Param("endExclusive") LocalDateTime endExclusive
    );

    @Query("""
        SELECT o.id AS orderId,
           o.bill.restaurantTable.number AS tableNumber,
           o.deliveredAt AS deliveredAt
        FROM Order o
        WHERE o.status = DELIVERED
        AND o.deliveredAt IS NOT NULL
        ORDER BY o.deliveredAt DESC, o.id DESC
    """)
    List<DashboardAlertProjection> findRecentDeliveredAlerts(Pageable pageable);

    interface DashboardAlertProjection {
        Long getOrderId();
        Integer getTableNumber();
        LocalDateTime getDeliveredAt();
    }
}
