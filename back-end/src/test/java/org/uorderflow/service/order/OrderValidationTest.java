package org.uorderflow.service.order;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.uorderflow.enums.order.OrderAction;
import org.uorderflow.enums.order.OrderStatus;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.Order;
import org.uorderflow.repository.OrderRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderValidationTest {

    @InjectMocks
    private OrderValidation orderValidation;

    @Mock
    private OrderRepository orderRepository;

    @Nested
    @DisplayName("validateOrder")
    class ValidateOrderTests {

        @Test
        @DisplayName("Should return order when found and action is null")
        void shouldReturnOrderWhenActionIsNull() {
            Order order = mock(Order.class);
            when(orderRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(order));

            Order result = orderValidation.validateOrder(1L, null);

            assertThat(result).isNotNull();
            verify(orderRepository, times(1)).findByIdWithDetails(1L);
        }

        @Test
        @DisplayName("Should throw EntityNotFoundException when order ID does not exist")
        void shouldThrowExceptionWhenOrderNotFound() {
            when(orderRepository.findByIdWithDetails(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderValidation.validateOrder(99L, null))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessage("Order not found with id 99.");
        }

        @Test
        @DisplayName("Should pass UPDATE action validation when status is WAITING")
        void shouldPassUpdateValidationWhenStatusIsWaiting() {
            Order order = mock(Order.class);
            when(order.getStatus()).thenReturn(OrderStatus.WAITING);
            when(orderRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(order));

            assertThatCode(() -> orderValidation.validateOrder(1L, OrderAction.UPDATE))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Should throw BusinessRuleException on UPDATE action when status is not WAITING")
        void shouldThrowExceptionOnUpdateWhenStatusIsNotWaiting() {
            Order order = mock(Order.class);
            when(order.getStatus()).thenReturn(OrderStatus.PREPARING);
            when(orderRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderValidation.validateOrder(1L, OrderAction.UPDATE))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("An order can only be edited if its status is WAITING.");
        }

        @Test
        @DisplayName("Should pass PREPARE action validation when status is WAITING")
        void shouldPassPrepareValidationWhenStatusIsWaiting() {
            Order order = mock(Order.class);
            when(order.getStatus()).thenReturn(OrderStatus.WAITING);
            when(orderRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(order));

            assertThatCode(() -> orderValidation.validateOrder(1L, OrderAction.PREPARE))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Should throw BusinessRuleException on PREPARE action when status is not WAITING")
        void shouldThrowExceptionOnPrepareWhenStatusIsNotWaiting() {
            Order order = mock(Order.class);
            when(order.getStatus()).thenReturn(OrderStatus.DELIVERED);
            when(orderRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderValidation.validateOrder(1L, OrderAction.PREPARE))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("An order can only be prepared if its status is WAITING.");
        }

        @Test
        @DisplayName("Should pass DELIVER action validation when status is PREPARING")
        void shouldPassDeliverValidationWhenStatusIsPreparing() {
            Order order = mock(Order.class);
            when(order.getStatus()).thenReturn(OrderStatus.PREPARING);
            when(orderRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(order));

            assertThatCode(() -> orderValidation.validateOrder(1L, OrderAction.DELIVER))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Should throw BusinessRuleException on DELIVER action when status is not PREPARING")
        void shouldThrowExceptionOnDeliverWhenStatusIsNotPreparing() {
            Order order = mock(Order.class);
            when(order.getStatus()).thenReturn(OrderStatus.WAITING);
            when(orderRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderValidation.validateOrder(1L, OrderAction.DELIVER))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("An order can only be delivered if its status is PREPARING.");
        }

        @Test
        @DisplayName("Should pass CANCEL action validation when status is not DELIVERED")
        void shouldPassCancelValidationWhenStatusIsNotDelivered() {
            Order order = mock(Order.class);
            when(order.getStatus()).thenReturn(OrderStatus.WAITING);
            when(orderRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(order));

            assertThatCode(() -> orderValidation.validateOrder(1L, OrderAction.CANCEL))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Should throw BusinessRuleException on CANCEL action when status is DELIVERED")
        void shouldThrowExceptionOnCancelWhenStatusIsDelivered() {
            Order order = mock(Order.class);
            when(order.getStatus()).thenReturn(OrderStatus.DELIVERED);
            when(orderRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(order));

            assertThatThrownBy(() -> orderValidation.validateOrder(1L, OrderAction.CANCEL))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("An order cannot be cancelled if its status is DELIVERED.");
        }
    }

}