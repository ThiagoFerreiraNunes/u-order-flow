package org.uorderflow.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.Bill;

import java.time.LocalDateTime;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {

    @Query(value = "SELECT b FROM Bill b " +
            "JOIN FETCH b.restaurantTable",
            countQuery = "SELECT count(b) FROM Bill b")
    Page<Bill> findAllPaged(Pageable pageable);

    @Query("SELECT DISTINCT b FROM Bill b " +
            "JOIN FETCH b.restaurantTable " +
            "LEFT JOIN FETCH b.orders " +
            "WHERE b.id = :id")
    Optional<Bill> findByIdWithDetails(@Param("id") Long id);

    @Query(
            value = "SELECT b FROM Bill b " +
                    "JOIN FETCH b.restaurantTable " +
                    "WHERE b.isDeleted = false " +
                    "AND b.createdAt BETWEEN :startOfDay AND :endOfDay",
            countQuery = "SELECT COUNT(b) FROM Bill b " +
                    "WHERE b.isDeleted = false " +
                    "AND b.createdAt BETWEEN :startOfDay AND :endOfDay"
    )
    Page<Bill> searchAllByDate(
            @Param("startOfDay")LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            Pageable pageable
    );
}
