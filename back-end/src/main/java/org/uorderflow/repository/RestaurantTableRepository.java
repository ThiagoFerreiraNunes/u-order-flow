package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.RestaurantTable;

import java.util.List;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    boolean existsByNumber(int number);

    @Query("SELECT r FROM RestaurantTable r " +
            "ORDER BY r.number")
    List<RestaurantTable> findAllSorted();

    @Query("SELECT COUNT(t) > 0 FROM RestaurantTable t WHERE t.number = :number AND t.id <> :id")
    boolean existsByNumberAndIdNot(@Param("number") Integer number, @Param("id") Long id);
}
