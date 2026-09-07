package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.ProductCategory;

import java.util.List;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    boolean existsByName(String name);

    @Query("SELECT p FROM ProductCategory p " +
            "WHERE p.isDeleted = :isDeleted " +
            "ORDER BY p.name")
    List<ProductCategory> findAllSorted(@Param("isDeleted") boolean isDeleted);
}
