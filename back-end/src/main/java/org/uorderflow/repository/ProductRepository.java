package org.uorderflow.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.Product;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByName(String name);

    @Query(value = "SELECT p FROM Product p " +
            "JOIN FETCH p.productCategory " +
            "WHERE p.isDeleted = :isDeleted AND " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))",
            countQuery = "SELECT COUNT(p) FROM Product p " +
                    "WHERE p.isDeleted = :isDeleted AND " +
                    "LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Product> findAllPagedByName(
            @Param("name") String name,
            @Param("isDeleted") boolean isDeleted,
            Pageable pageable
    );

    @Query(value = "SELECT p FROM Product p " +
            "JOIN FETCH p.productCategory " +
            "WHERE p.isDeleted = :isDeleted",
            countQuery = "SELECT COUNT(p) FROM Product p " +
                    "WHERE p.isDeleted = :isDeleted")
    Page<Product> findAllPaged(
            @Param("isDeleted") boolean isDeleted,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.productCategory " +
            "WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") Long id);
}
