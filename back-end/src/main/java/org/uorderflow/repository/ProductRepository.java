package org.uorderflow.repository;

import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.Product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByName(String name);

    @Query(value = "SELECT p FROM Product p " +
            "JOIN FETCH p.productCategory " +
            "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))",
            countQuery = "SELECT COUNT(p) FROM Product p " +
                    "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Product> findAllPagedByName(
            @Param("name") String name,
            Pageable pageable
    );

    @Query(value = "SELECT p FROM Product p " +
            "JOIN FETCH p.productCategory ",
            countQuery = "SELECT COUNT(p) FROM Product p ")
    Page<Product> findAllPaged(
            Pageable pageable
    );

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.productCategory " +
            "WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE LOWER(p.name) = LOWER(:name) AND p.id <> :id")
    boolean existsByNameAndIdNot(@Param("name") String name, @Param("id") Long id);

    @Query("""
        SELECT op.product.id AS productId,
           op.product.name AS productName,
           SUM(op.quantity) AS quantitySold,
           SUM(op.unitPrice * op.quantity) AS totalRevenue
        FROM OrderProduct op
        WHERE op.order.bill.status = PAID
        AND op.order.bill.paidAt >= :startInclusive
        AND op.order.bill.paidAt < :endExclusive
        GROUP BY op.product.id, op.product.name
        ORDER BY quantitySold DESC, productName ASC, productId ASC
    """)
    List<TopProductAggregate> findTopProductsSoldBetween(
            @Param("startInclusive") LocalDateTime startInclusive,
            @Param("endExclusive") LocalDateTime endExclusive,
            Pageable pageable
    );

    interface TopProductAggregate {
        Long getProductId();
        String getProductName();
        Long getQuantitySold();
        BigDecimal getTotalRevenue();
    }
}
