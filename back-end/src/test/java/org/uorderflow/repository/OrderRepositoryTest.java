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
import org.uorderflow.dto.orderProduct.OrderProductCreateDTO;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableCreateDTO;
import org.uorderflow.dto.user.UserRegisterDTO;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.model.*;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class OrderRepositoryTest {

    @Autowired private EntityManager entityManager;
    @Autowired private OrderRepository orderRepository;

    @Test
    @DisplayName("Should return a page of orders including their employee, bill, and restaurant table details")
    void shouldFindAllPaged() {
        setupMockOrders();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> result = orderRepository.findAllPaged(pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getEmployee()).isNotNull();
        assertThat(result.getContent().get(0).getBill()).isNotNull();
        assertThat(result.getContent().get(0).getBill().getRestaurantTable()).isNotNull();
    }

    @Test
    @DisplayName("Should return an empty page when there are no orders in the database")
    void shouldNotFindAllPagedWhenEmpty() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> result = orderRepository.findAllPaged(pageable);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return an order with its full details (employee, bill, table, and items) when fetching by a valid ID")
    void shouldFindByIdWithDetails() {
        User employee = createUser("Lucas");
        RestaurantTable table = createRestaurantTable(5);
        Bill bill = createBill("Thiago", table);

        Order order = new Order(employee);
        bill.addOrder(order);

        ProductCategory category = createProductCategory("Beverages");
        Product product = createProduct("Coca-Cola", new BigDecimal("5.00"), category);

        OrderProductCreateDTO itemDTO = new OrderProductCreateDTO(product.getId(), "Sem gelo", 2);
        OrderProduct item = new OrderProduct(itemDTO, product);

        order.addItem(item);

        entityManager.persist(order);
        entityManager.flush();
        entityManager.clear();

        Optional<Order> result = orderRepository.findByIdWithDetails(order.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getEmployee().getName()).isEqualTo("Lucas");
        assertThat(result.get().getBill().getCustomer()).isEqualTo("Thiago");
        assertThat(result.get().getBill().getRestaurantTable().getNumber()).isEqualTo(5);
        assertThat(result.get().getItems()).isNotEmpty();
        assertThat(result.get().getItems()).hasSize(1);
        assertThat(result.get().getItems().get(0).getProduct().getName()).isEqualTo("Coca-Cola");
    }

    @Test
    @DisplayName("Should return an empty Optional when fetching by a non-existent order ID")
    void shouldNotFindByIdWhenItDoesNotExist() {
        Optional<Order> result = orderRepository.findByIdWithDetails(999L);
        assertThat(result).isEmpty();
    }

    private ProductCategory createProductCategory(String name) {
        ProductCategory productCategory = new ProductCategory(new ProductCategoryCreateDTO(name));
        entityManager.persist(productCategory);
        return productCategory;
    }

    private Product createProduct(String name, BigDecimal price, ProductCategory category) {
        Product product = new Product(new ProductCreateDTO(
                name,
                "Description",
                "img_url",
                price,
                category.getId(),
                true
        ), category);
        entityManager.persist(product);
        return product;
    }

    private User createUser(String name) {
        User user = new User(new UserRegisterDTO(
                name,
                name.toLowerCase() + "@gmail.com",
                "12345678910",
                UserRole.WAITER
        ), "12345678910");
        entityManager.persist(user);
        return user;
    }

    private RestaurantTable createRestaurantTable(int number) {
        RestaurantTable restaurantTable = new RestaurantTable(new RestaurantTableCreateDTO(number));
        entityManager.persist(restaurantTable);
        return restaurantTable;
    }

    private Bill createBill(String customer, RestaurantTable table) {
        Bill bill = new Bill(new BillCreateDTO(customer, table.getId()), table);
        entityManager.persist(bill);
        return bill;
    }

    private void setupMockOrders() {
        User employee = createUser("Arthur");
        RestaurantTable table = createRestaurantTable(1);
        Bill bill = createBill("Guilherme", table);

        Order order1 = new Order(employee);
        order1.setBill(bill);

        Order order2 = new Order(employee);
        order2.setBill(bill);

        entityManager.persist(order1);
        entityManager.persist(order2);
    }
}