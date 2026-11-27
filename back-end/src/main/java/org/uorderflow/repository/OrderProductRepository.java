package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.enums.order.OrderStatus;
import org.uorderflow.model.OrderProduct;

import java.util.List;

public interface OrderProductRepository extends JpaRepository<OrderProduct, Long> {

    @Query("""
        SELECT COUNT(op) > 0 
        FROM OrderProduct op 
        WHERE op.product.id = :productId 
        AND op.order.status IN (:statuses)
    """)
    boolean existsByProductIdAndOrderStatusIn(
            @Param("productId") Long productId,
            @Param("statuses") List<OrderStatus> statuses
    );
}
