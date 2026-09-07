package org.uorderflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.uorderflow.model.RestaurantTable;

import java.util.List;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    boolean existsByNumber(int number);

    @Query("SELECT r FROM RestaurantTable r " +
            "WHERE r.isDeleted = :isDeleted " +
            "ORDER BY r.number")
    List<RestaurantTable> findAllSorted(@Param("isDeleted") boolean isDeleted);
}
