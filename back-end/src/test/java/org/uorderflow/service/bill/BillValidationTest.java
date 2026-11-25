package org.uorderflow.service.bill;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.uorderflow.enums.bill.BillAction;
import org.uorderflow.enums.bill.BillStatus;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.Bill;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.BillRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillValidationTest {
    @InjectMocks
    private BillValidation billValidation;

    @Mock
    private BillRepository billRepository;

    private RestaurantTable createMockRestaurantTable(Long id) {
        return new RestaurantTable(id, 1, false);
    }

    private Bill createMockBill(Long id, BillStatus status) {
        return new Bill(
                id,
                "Emerson",
                status,
                LocalDateTime.now(),
                null,
                createMockRestaurantTable(1L),
                new ArrayList<>()
        );
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when bill is not found")
    void shouldThrowExceptionWhenBillNotFound() {
        when(billRepository.findByIdWithDetails(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> billValidation.validateBill(1L, null))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessage("Bill not found with id " + 1L + ".");

        verify(billRepository, times(1)).findByIdWithDetails(1L);
    }

    @Test
    @DisplayName("Should return bill without validation when action is null")
    void shouldReturnBillWhenActionIsNull() {
        Bill bill = createMockBill(1L, BillStatus.CLOSED);
        when(billRepository.findByIdWithDetails(bill.getId())).thenReturn(Optional.of(bill));

        Bill response = billValidation.validateBill(bill.getId(), null);

        assertThat(response).isNotNull();
        assertThat(response).isEqualTo(bill);
        verify(billRepository, times(1)).findByIdWithDetails(bill.getId());
    }

    @Nested
    @DisplayName("UPDATE Action")
    class UpdateActionTests {

        @Test
        @DisplayName("Should pass validation when updating bill with OPEN status")
        void shouldValidateUpdateWithOpenStatus() {
            Bill bill = createMockBill(1L, BillStatus.OPEN);
            when(billRepository.findByIdWithDetails(bill.getId())).thenReturn(Optional.of(bill));

            Bill response = billValidation.validateBill(bill.getId(), BillAction.UPDATE);

            assertThat(response).isEqualTo(bill);
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when updating bill with CLOSED status")
        void shouldThrowExceptionWhenUpdatingClosedBill() {
            Bill bill = createMockBill(1L, BillStatus.CLOSED);
            when(billRepository.findByIdWithDetails(bill.getId())).thenReturn(Optional.of(bill));

            assertThatThrownBy(() -> billValidation.validateBill(bill.getId(), BillAction.UPDATE))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("A bill can only be updated if its status is OPEN.");
        }
    }

    @Nested
    @DisplayName("CANCEL Action")
    class CancelActionTests {

        @Test
        @DisplayName("Should pass validation when cancelling bill with OPEN or CLOSED status")
        void shouldValidateCancelWithOpenStatus() {
            Bill bill = createMockBill(1L, BillStatus.OPEN);
            when(billRepository.findByIdWithDetails(bill.getId())).thenReturn(Optional.of(bill));

            Bill result = billValidation.validateBill(bill.getId(), BillAction.CANCEL);

            assertThat(result).isEqualTo(bill);
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when cancelling bill with PAID status")
        void shouldThrowExceptionWhenCancellingPaidBill() {
            Bill bill = createMockBill(1L, BillStatus.PAID);
            when(billRepository.findByIdWithDetails(bill.getId())).thenReturn(Optional.of(bill));

            assertThatThrownBy(() -> billValidation.validateBill(bill.getId(), BillAction.CANCEL))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("A bill cannot be cancelled if its status is PAID.");
        }
    }

    @Nested
    @DisplayName("CLOSE Action")
    class CloseActionTests {

        @Test
        @DisplayName("Should pass validation when closing bill with OPEN status")
        void shouldValidateCloseWithOpenStatus() {
            Bill bill = createMockBill(1L, BillStatus.OPEN);
            when(billRepository.findByIdWithDetails(bill.getId())).thenReturn(Optional.of(bill));

            Bill result = billValidation.validateBill(bill.getId(), BillAction.CLOSE);

            assertThat(result).isEqualTo(bill);
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when closing bill with CANCELLED status")
        void shouldThrowExceptionWhenClosingCancelledBill() {
            Bill bill = createMockBill(1L, BillStatus.CANCELLED);
            when(billRepository.findByIdWithDetails(bill.getId())).thenReturn(Optional.of(bill));

            assertThatThrownBy(() -> billValidation.validateBill(bill.getId(), BillAction.CLOSE))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("A bill cannot be closed if its status is CANCELLED.");
        }
    }

    @Nested
    @DisplayName("PAY Action")
    class PayActionTests {

        @Test
        @DisplayName("Should pass validation when paying bill with CLOSED status")
        void shouldValidatePayWithClosedStatus() {
            Bill bill = createMockBill(1L, BillStatus.CLOSED);
            when(billRepository.findByIdWithDetails(bill.getId())).thenReturn(Optional.of(bill));

            Bill result = billValidation.validateBill(bill.getId(), BillAction.PAY);

            assertThat(result).isEqualTo(bill);
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when paying bill with CANCELLED status")
        void shouldThrowExceptionWhenPayingCancelledBill() {
            Bill bill = createMockBill(1L, BillStatus.CANCELLED);
            when(billRepository.findByIdWithDetails(bill.getId())).thenReturn(Optional.of(bill));

            assertThatThrownBy(() -> billValidation.validateBill(bill.getId(), BillAction.PAY))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("A bill cannot be paid if its status is CANCELLED.");
        }
    }
}