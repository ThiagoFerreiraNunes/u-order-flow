package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.Food;

import java.util.List;
import java.util.Optional;

public interface FoodRepository extends JpaRepository<Food, Long> {

    @Query("SELECT f FROM Food f " +
            "JOIN FETCH f.foodCategory " +
            "WHERE f.isAvailable = TRUE " +
            "ORDER BY f.name")
    List<Food> findAllByAvailableAndSortByName();

    @Query("SELECT f FROM Food f " +
            "JOIN FETCH f.foodCategory " +
            "WHERE f.id = :id")
    Optional<Food> findByIdWithDetails(@Param("id") Long id);
}
