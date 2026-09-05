package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.uorderflow.model.ProductCategory;

import java.util.List;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    boolean existsByName(String name);

    @Query("SELECT p FROM ProductCategory p " +
            "WHERE p.isDeleted = FALSE")
    List<ProductCategory> findAllByNotDeletedAndSortByName();
}
