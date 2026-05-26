package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.Drink;

import java.util.List;
import java.util.Optional;

public interface DrinkRepository extends JpaRepository<Drink, Long> {

    @Query("SELECT d FROM Drink d " +
            "JOIN FETCH d.drinkCategory " +
            "WHERE d.isAvailable = TRUE " +
            "ORDER BY d.name")
    List<Drink> findAllByAvailableAndSortByName();

    @Query("SELECT d FROM Drink d " +
            "JOIN FETCH d.drinkCategory " +
            "WHERE d.id = :id")
    Optional<Drink> findByIdWithDetails(@Param("id") Long id);
}
