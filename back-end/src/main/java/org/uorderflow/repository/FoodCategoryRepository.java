package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.uorderflow.model.FoodCategory;

import java.util.List;

public interface FoodCategoryRepository extends JpaRepository<FoodCategory, Long> {
    @Query("SELECT f FROM FoodCategory f WHERE f.isAvailable ORDER BY f.name")
    List<FoodCategory> findAllByAvailableAndSortByName();
}
