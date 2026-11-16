package org.uorderflow.repository;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.uorderflow.dto.bill.BillCreateDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableCreateDTO;
import org.uorderflow.model.Bill;
import org.uorderflow.model.RestaurantTable;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class BillRepositoryTest {

    @Autowired private EntityManager entityManager;
    @Autowired private BillRepository billRepository;

    @Test
    @DisplayName("Should return a page of bills including their restaurant tables")
    void shouldFindAllPaged() {
        setupMockBills();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Bill> result = billRepository.findAllPaged(pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent().get(0).getRestaurantTable()).isNotNull();
    }

    @Test
    @DisplayName("Should return a page of bills filtered by a valid creation date range")
    void shouldFindAllPagedByDate() {
        setupMockBills();

        LocalDateTime startOfDay = LocalDateTime.now().minusHours(1);
        LocalDateTime endOfDay = LocalDateTime.now().plusHours(1);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Bill> result = billRepository.findAllPagedByDate(startOfDay, endOfDay, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(3);
    }

    @Test
    @DisplayName("Should return an empty page when searching for bills outside the creation date range")
    void shouldNotFindAllPagedByDateWhenOutOfRange() {
        setupMockBills();

        LocalDateTime startOfDay = LocalDateTime.now().plusDays(5);
        LocalDateTime endOfDay = LocalDateTime.now().plusDays(6);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Bill> result = billRepository.findAllPagedByDate(startOfDay, endOfDay, pageable);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return a bill with its table and orders details when fetching by a valid ID")
    void shouldFindByIdWithDetails() {
        RestaurantTable table = createRestaurantTable(10);
        Bill bill = new Bill(new BillCreateDTO("Alice", table.getId()), table);
        entityManager.persist(bill);

        Optional<Bill> result = billRepository.findByIdWithDetails(bill.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getCustomer()).isEqualTo("Alice");
        assertThat(result.get().getRestaurantTable().getNumber()).isEqualTo(10);
    }

    @Test
    @DisplayName("Should return an empty Optional when fetching by a non-existent bill ID")
    void shouldNotFindByIdWhenItDoesNotExist() {
        Optional<Bill> result = billRepository.findByIdWithDetails(999L);
        assertThat(result).isEmpty();
    }

    private RestaurantTable createRestaurantTable(int number) {
        RestaurantTable restaurantTable = new RestaurantTable(new RestaurantTableCreateDTO(number));
        entityManager.persist(restaurantTable);
        return restaurantTable;
    }

    private void setupMockBills() {
        RestaurantTable table1 = createRestaurantTable(1);
        RestaurantTable table2 = createRestaurantTable(2);

        Bill bill1 = new Bill(new BillCreateDTO("Thiago", table1.getId()), table1);
        Bill bill2 = new Bill(new BillCreateDTO("Arthur", table1.getId()), table1);
        Bill bill3 = new Bill(new BillCreateDTO("Lucas", table2.getId()), table2);

        entityManager.persist(bill1);
        entityManager.persist(bill2);
        entityManager.persist(bill3);
    }
}