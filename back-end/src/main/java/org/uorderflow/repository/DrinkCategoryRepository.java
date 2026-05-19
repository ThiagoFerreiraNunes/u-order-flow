package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.uorderflow.model.DrinkCategory;

import java.util.List;

public interface DrinkCategoryRepository extends JpaRepository<DrinkCategory, Long> {

    @Query("SELECT d FROM DrinkCategory d" +
            "WHERE d.getIsAvailable = TRUE" +
            "ORDER BY d.name")
    List<DrinkCategory> findAllByAvailableAndSortByName();
}
