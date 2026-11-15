package org.uorderflow.service.order;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.uorderflow.dto.order.OrderCreateDTO;
import org.uorderflow.dto.order.OrderDetailsResponseDTO;
import org.uorderflow.dto.order.OrderSummaryResponseDTO;
import org.uorderflow.dto.order.OrderUpdateDTO;
import org.uorderflow.dto.orderProduct.OrderProductCreateDTO;
import org.uorderflow.enums.bill.BillStatus;
import org.uorderflow.enums.order.OrderAction;
import org.uorderflow.enums.order.OrderStatus;
import org.uorderflow.enums.product.ProductAction;
import org.uorderflow.enums.user.UserAction;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.model.*;
import org.uorderflow.repository.OrderRepository;
import org.uorderflow.service.bill.BillValidation;
import org.uorderflow.service.product.ProductValidation;
import org.uorderflow.service.user.UserValidation;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @InjectMocks
    private OrderService orderService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderValidation orderValidation;

    @Mock
    private BillValidation billValidation;

    @Mock
    private ProductValidation productValidation;

    @Mock
    private UserValidation userValidation;

    private RestaurantTable createMockRestaurantTable(Long id) {
        return new RestaurantTable(id, 1, false);
    }

    private ProductCategory createMockProductCategory(Long id, String name){
        return new ProductCategory(id, name, false);
    }

    private User createMockUser(Long id) {
        return new User(
                id,
                "Fernando",
                "fernando@restaurant.com",
                "secret",
                UserRole.WAITER,
                false
        );
    }

    private Bill createMockBill(Long id) {
        RestaurantTable restaurantTable = createMockRestaurantTable(1L);
        return new Bill(
                id,
                "Emerson",
                BillStatus.OPEN,
                LocalDateTime.now(),
                null,
                restaurantTable,
                new ArrayList<>()
        );
    }

    private Order createMockOrder(Long id, User employee, Bill bill) {
        return new Order(
                id,
                OrderStatus.WAITING,
                LocalDateTime.now(),
                null,
                new ArrayList<>(),
                employee,
                bill
        );
    }

    private Product createMockProduct(Long id ,BigDecimal price, String productCategoryName) {
        ProductCategory productCategory = createMockProductCategory(1L, productCategoryName);
        Product product = mock(Product.class);
        when(product.getId()).thenReturn(id);
        when(product.getPrice()).thenReturn(price);
        when(product.getProductCategory()).thenReturn(productCategory);

        return product;
    }

    @Nested
    @DisplayName("createOrder")
    class CreateOrderTests {

        @Test
        @DisplayName("Should create order and add items successfully")
        void shouldCreateOrderSuccessfully() {
            User employee = createMockUser(2L);
            Bill bill = createMockBill(1L);
            Product product = createMockProduct(20L, new BigDecimal("15.50"), "Desserts");
            OrderProductCreateDTO itemCreateDTO = new OrderProductCreateDTO(product.getId(), "No onions", 2);
            OrderCreateDTO orderCreateDTO = new OrderCreateDTO(employee.getId(), List.of(itemCreateDTO));
            when(billValidation.validateBill(bill.getId(), null)).thenReturn(bill);
            when(userValidation.validateUser(employee.getId(), UserAction.CREATE_ORDER)).thenReturn(employee);
            when(productValidation.validateProduct(product.getId(), ProductAction.CREATE_ORDER_PRODUCT)).thenReturn(product);

            OrderDetailsResponseDTO response = orderService.createOrder(bill.getId(), orderCreateDTO);

            assertThat(response).isNotNull();
            assertThat(bill.getOrders()).hasSize(1);
            verify(billValidation, times(1)).validateBill(bill.getId(), null);
            verify(userValidation, times(1)).validateUser(employee.getId(), UserAction.CREATE_ORDER);
            verify(productValidation, times(1)).validateProduct(product.getId(), ProductAction.CREATE_ORDER_PRODUCT);
            verify(orderRepository, times(1)).save(any(Order.class));
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should return paged list of order summaries")
        void shouldReturnPagedOrderSummaries() {
            Pageable pageable = PageRequest.of(0, 10);
            Order order = createMockOrder(1L, createMockUser(2L), createMockBill(1L));
            Page<Order> orderPage = new PageImpl<>(List.of(order));
            when(orderRepository.findAllPaged(pageable)).thenReturn(orderPage);

            Page<OrderSummaryResponseDTO> response = orderService.findAll(pageable);

            assertThat(response).hasSize(1);
            verify(orderRepository, times(1)).findAllPaged(pageable);
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return order details DTO when ID is found")
        void shouldReturnOrderById() {
            Order order = createMockOrder(1L, createMockUser(2L), createMockBill(1L));
            when(orderValidation.validateOrder(order.getId(), null)).thenReturn(order);

            OrderDetailsResponseDTO response = orderService.findById(order.getId());

            assertThat(response).isNotNull();
            verify(orderValidation, times(1)).validateOrder(order.getId(), null);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("Should update employee and replace items when new items are provided")
        void shouldUpdateEmployeeAndItems() {
            User oldEmployee = createMockUser(2L);
            User newEmployee = createMockUser(3L);
            Product newProduct = createMockProduct(20L, new BigDecimal("12.00"), "Beverages");
            OrderProductCreateDTO newItemDTO = new OrderProductCreateDTO(20L, "Extra cheese", 1);
            OrderUpdateDTO updateDTO = new OrderUpdateDTO(3L, List.of(newItemDTO));
            Order order = createMockOrder(1L, oldEmployee, createMockBill(1L));
            when(orderValidation.validateOrder(order.getId(), OrderAction.UPDATE)).thenReturn(order);
            when(userValidation.validateUser(newEmployee.getId(), UserAction.CREATE_ORDER)).thenReturn(newEmployee);
            when(productValidation.validateProduct(20L, ProductAction.CREATE_ORDER_PRODUCT)).thenReturn(newProduct);

            OrderDetailsResponseDTO response = orderService.update(order.getId(), updateDTO);

            assertThat(response).isNotNull();
            assertThat(order.getEmployee()).isEqualTo(newEmployee);
            assertThat(order.getItems()).hasSize(1);

            verify(productValidation, times(1)).validateProduct(20L, ProductAction.CREATE_ORDER_PRODUCT);
        }

        @Test
        @DisplayName("Should update employee but leave items unchanged when items list is null")
        void shouldUpdateEmployeeOnlyWhenItemsIsNull() {
            OrderUpdateDTO updateDTO = new OrderUpdateDTO(3L, null);
            User oldEmployee = createMockUser(2L);
            User newEmployee = createMockUser(3L);
            Order order = createMockOrder(1L, oldEmployee, createMockBill(1L));
            when(orderValidation.validateOrder(order.getId(), OrderAction.UPDATE)).thenReturn(order);
            when(userValidation.validateUser(newEmployee.getId(), UserAction.CREATE_ORDER)).thenReturn(newEmployee);

            OrderDetailsResponseDTO response = orderService.update(order.getId(), updateDTO);

            assertThat(response).isNotNull();
            assertThat(order.getEmployee()).isEqualTo(newEmployee);
            verify(productValidation, never()).validateProduct(anyLong(), any());
        }
    }

    @Nested
    @DisplayName("State Transitions (prepare, deliver, cancel)")
    class StateTransitionTests {

        @Test
        @DisplayName("Should change order status to PREPARING when prepareOrder is called")
        void shouldPrepareOrder() {
            Order order = createMockOrder(1L, createMockUser(2L), createMockBill(1L));

            when(orderValidation.validateOrder(order.getId(), OrderAction.PREPARE)).thenReturn(order);

            OrderDetailsResponseDTO response = orderService.prepareOrder(order.getId());

            assertThat(response).isNotNull();
            assertThat(order.getStatus()).isEqualTo(OrderStatus.PREPARING);
            verify(orderValidation, times(1)).validateOrder(order.getId(), OrderAction.PREPARE);
        }

        @Test
        @DisplayName("Should change order status to DELIVERED and set deliveredAt when deliverOrder is called")
        void shouldDeliverOrder() {
            Order order = createMockOrder(1L, createMockUser(2L), createMockBill(1L));
            order.setStatus(OrderStatus.PREPARING);

            when(orderValidation.validateOrder(order.getId(), OrderAction.DELIVER)).thenReturn(order);

            OrderDetailsResponseDTO response = orderService.deliverOrder(order.getId());

            assertThat(response).isNotNull();
            assertThat(order.getStatus()).isEqualTo(OrderStatus.DELIVERED);
            assertThat(order.getDeliveredAt()).isNotNull();
            verify(orderValidation, times(1)).validateOrder(order.getId(), OrderAction.DELIVER);
        }

        @Test
        @DisplayName("Should change order status to CANCELLED when cancelOrder is called")
        void shouldCancelOrder() {
            Order order = createMockOrder(1L, createMockUser(2L), createMockBill(1L));

            when(orderValidation.validateOrder(order.getId(), OrderAction.CANCEL)).thenReturn(order);

            OrderDetailsResponseDTO response = orderService.cancelOrder(order.getId());

            assertThat(response).isNotNull();
            assertThat(order.getStatus()).isEqualTo(OrderStatus.CANCELLED);
            verify(orderValidation, times(1)).validateOrder(order.getId(), OrderAction.CANCEL);
        }
    }
}