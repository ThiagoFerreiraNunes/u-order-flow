package org.uorderflow.repository;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.uorderflow.dto.restaurantTable.RestaurantTableCreateDTO;
import org.uorderflow.model.RestaurantTable;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class RestaurantTableRepositoryTest {

    @Autowired private EntityManager entityManager;
    @Autowired private RestaurantTableRepository restaurantTableRepository;

    @Test
    @DisplayName("Should return a sorted list with all active (non-deleted) restaurant tables")
    void shouldFindAllByIsDeletedFalse() {
        setupMockRestaurantTables();
        List<RestaurantTable> result = restaurantTableRepository.findAllSorted(false);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return a sorted list with all deleted restaurant tables")
    void shouldFindAllByIsDeletedTrue() {
        setupMockRestaurantTables();
        List<RestaurantTable> result = restaurantTableRepository.findAllSorted(true);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
    }

    private void setupMockRestaurantTables(){
        RestaurantTable r1 = new RestaurantTable(new RestaurantTableCreateDTO(1));
        RestaurantTable r2 = new RestaurantTable(new RestaurantTableCreateDTO(2));
        RestaurantTable r3 = new RestaurantTable(new RestaurantTableCreateDTO(3));
        r3.delete();
        RestaurantTable r4 = new RestaurantTable(new RestaurantTableCreateDTO(4));

        entityManager.persist(r1);
        entityManager.persist(r2);
        entityManager.persist(r3);
        entityManager.persist(r4);
    }
}