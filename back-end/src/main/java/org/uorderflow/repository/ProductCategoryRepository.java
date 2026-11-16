package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.ProductCategory;

import java.util.List;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    boolean existsByName(String name);

    @Query("SELECT p FROM ProductCategory p " +
            "ORDER BY p.name")
    List<ProductCategory> findAllSorted();

    @Query("SELECT COUNT(c) > 0 FROM ProductCategory c WHERE LOWER(c.name) = LOWER(:name) AND c.id <> :id")
    boolean existsByNameAndIdNot(@Param("name") String name, @Param("id") Long id);
}
