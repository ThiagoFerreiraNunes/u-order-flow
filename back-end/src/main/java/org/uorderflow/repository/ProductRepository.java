package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.productCategory " +
            "WHERE p.isAvailable = TRUE " +
            "ORDER BY p.name")
    List<Product> findAllByAvailableAndSortByName();

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.productCategory " +
            "WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") Long id);
}
