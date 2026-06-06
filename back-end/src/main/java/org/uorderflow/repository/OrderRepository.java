package org.uorderflow.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.Order;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query(value = "SELECT o FROM Order o JOIN FETCH o.restaurantTable",
            countQuery = "SELECT count(0) FROM Order o")
    Page<Order> findAllPaged(Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o " +
            "JOIN FETCH o.restaurantTable " +
            "JOIN FETCH o.items " +
            "WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") Long id);
}
