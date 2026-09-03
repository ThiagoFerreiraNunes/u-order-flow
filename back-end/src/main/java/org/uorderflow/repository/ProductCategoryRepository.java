package org.uorderflow.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.uorderflow.model.ProductCategory;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    boolean existsByName(String name);

    @Query("SELECT p FROM ProductCategory p " +
            "WHERE p.isDeleted = FALSE")
    Page<ProductCategory> findAllPagedByIsDeletedFalse(Pageable pageable);
}
