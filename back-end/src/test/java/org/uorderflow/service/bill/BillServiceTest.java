package org.uorderflow.service.bill;

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
import org.uorderflow.dto.bill.BillCreateDTO;
import org.uorderflow.dto.bill.BillDetailsResponseDTO;
import org.uorderflow.dto.bill.BillSummaryResponseDTO;
import org.uorderflow.dto.bill.BillUpdateDTO;
import org.uorderflow.enums.bill.BillAction;
import org.uorderflow.enums.bill.BillStatus;
import org.uorderflow.enums.generic.ValidateAction;
import org.uorderflow.model.Bill;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.BillRepository;
import org.uorderflow.service.restaurantTable.RestaurantTableValidation;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillServiceTest {

    @InjectMocks
    private BillService billService;

    @Mock
    private BillRepository billRepository;

    @Mock
    private BillValidation billValidation;

    @Mock
    private RestaurantTableValidation restaurantTableValidation;

    private RestaurantTable createMockRestaurantTable(Long id) {
        return new RestaurantTable(id, 1, false);
    }

    private Bill createMockBill(Long id, BillStatus status) {
        RestaurantTable restaurantTable = createMockRestaurantTable(1L);
        return new Bill(
                id,
                "Emerson",
                status != null ? status : BillStatus.OPEN,
                LocalDateTime.now(),
                null,
                restaurantTable,
                new ArrayList<>()
        );
    }

    @Nested
    @DisplayName("createBill")
    class CreateBillTests {

        @Test
        @DisplayName("Should create bill successfully")
        void shouldCreateBillSuccessfully() {
            BillCreateDTO createDTO = new BillCreateDTO("Jonas", 1L);
            RestaurantTable restaurantTable = createMockRestaurantTable(1L);
            when(restaurantTableValidation.validateRestaurantTable(restaurantTable.getId(), ValidateAction.ACTIVE_CHECK))
                    .thenReturn(restaurantTable);

            BillDetailsResponseDTO response = billService.createBill(createDTO);

            assertThat(response).isNotNull();
            assertThat(response.customer()).isEqualTo("Jonas");
            verify(restaurantTableValidation, times(1)).validateRestaurantTable(restaurantTable.getId(), ValidateAction.ACTIVE_CHECK);
            verify(billRepository, times(1)).save(any(Bill.class));
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should return paged list without date filter when date is null")
        void shouldReturnPagedListWithoutDateFilter() {
            Pageable pageable = PageRequest.of(0, 10);
            Bill bill = createMockBill(1L, BillStatus.OPEN);
            Page<Bill> billPage = new PageImpl<>(List.of(bill));
            when(billRepository.findAllPaged(pageable)).thenReturn(billPage);

            Page<BillSummaryResponseDTO> response = billService.findAll(null, pageable);

            assertThat(response).hasSize(1);
            verify(billRepository, times(1)).findAllPaged(pageable);
            verify(billRepository, never()).findAllPagedByDate(any(), any(), any());
        }

        @Test
        @DisplayName("Should return paged list with date filter when date is provided")
        void shouldReturnPagedListWithDateFilter() {
            LocalDate date = LocalDate.of(2026, 3, 30);
            Pageable pageable = PageRequest.of(0, 10);
            Bill bill = createMockBill(1L, BillStatus.OPEN);
            Page<Bill> billPage = new PageImpl<>(List.of(bill));
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
            when(billRepository.findAllPagedByDate(eq(startOfDay), eq(endOfDay), eq(pageable)))
                    .thenReturn(billPage);

            Page<BillSummaryResponseDTO> response = billService.findAll(date, pageable);

            assertThat(response).hasSize(1);
            verify(billRepository, times(1)).findAllPagedByDate(eq(startOfDay), eq(endOfDay), eq(pageable));
            verify(billRepository, never()).findAllPaged(any());
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return bill details DTO when ID exists")
        void shouldReturnBillById() {
            Bill bill = createMockBill(1L, BillStatus.OPEN);
            when(billValidation.validateBill(bill.getId(), null)).thenReturn(bill);

            BillDetailsResponseDTO response = billService.findById(bill.getId());

            assertThat(response).isNotNull();
            verify(billValidation, times(1)).validateBill(bill.getId(), null);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("Should update customer name and restaurant table when both are provided")
        void shouldUpdateCustomerAndTable() {
            BillUpdateDTO updateDTO = new BillUpdateDTO("Cleber", 2L);
            Bill bill = createMockBill(1L, BillStatus.OPEN);
            RestaurantTable newRestaurantTable = createMockRestaurantTable(2L);
            when(billValidation.validateBill(bill.getId(), BillAction.UPDATE)).thenReturn(bill);
            when(restaurantTableValidation.validateRestaurantTable(newRestaurantTable.getId(), ValidateAction.ACTIVE_CHECK))
                    .thenReturn(newRestaurantTable);

            BillDetailsResponseDTO response = billService.update(bill.getId(), updateDTO);

            assertThat(response).isNotNull();
            assertThat(bill.getCustomer()).isEqualTo("Cleber");
            assertThat(bill.getRestaurantTable()).isEqualTo(newRestaurantTable);
            verify(billValidation, times(1)).validateBill(bill.getId(), BillAction.UPDATE);
            verify(restaurantTableValidation, times(1))
                    .validateRestaurantTable(newRestaurantTable.getId(), ValidateAction.ACTIVE_CHECK);
        }

        @Test
        @DisplayName("Should update customer name only when table ID is null")
        void shouldUpdateCustomerOnlyWhenTableIdIsNull() {
            BillUpdateDTO updateDTO = new BillUpdateDTO("Jonas", null);
            Bill bill = createMockBill(1L, BillStatus.OPEN);
            when(billValidation.validateBill(bill.getId(), BillAction.UPDATE)).thenReturn(bill);

            BillDetailsResponseDTO response = billService.update(bill.getId(), updateDTO);

            assertThat(response).isNotNull();
            assertThat(bill.getCustomer()).isEqualTo("Jonas");
            verify(billValidation, times(1)).validateBill(bill.getId(), BillAction.UPDATE);
            verify(restaurantTableValidation, never()).validateRestaurantTable(any(), any());
        }
    }

    @Nested
    @DisplayName("State Transitions (closeBill, payBill, cancelBill)")
    class StateTransitionTests {

        @Test
        @DisplayName("Should change status to CLOSED when closeBill is called")
        void shouldCloseBill() {
            Bill bill = createMockBill(1L, BillStatus.OPEN);
            when(billValidation.validateBill(bill.getId(), BillAction.CLOSE)).thenReturn(bill);

            BillDetailsResponseDTO response = billService.closeBill(bill.getId());

            assertThat(response).isNotNull();
            assertThat(bill.getStatus()).isEqualTo(BillStatus.CLOSED);
            verify(billValidation, times(1)).validateBill(bill.getId(), BillAction.CLOSE);
        }

        @Test
        @DisplayName("Should change status to PAID and set paidAt date when payBill is called")
        void shouldPayBill() {
            Bill bill = createMockBill(1L, BillStatus.CLOSED);
            when(billValidation.validateBill(bill.getId(), BillAction.PAY)).thenReturn(bill);

            BillDetailsResponseDTO response = billService.payBill(bill.getId());

            assertThat(response).isNotNull();
            assertThat(bill.getStatus()).isEqualTo(BillStatus.PAID);
            assertThat(bill.getPaidAt()).isNotNull();
            verify(billValidation, times(1)).validateBill(bill.getId(), BillAction.PAY);
        }

        @Test
        @DisplayName("Should change status to CANCELLED when cancelBill is called")
        void shouldCancelBill() {
            Bill bill = createMockBill(1L, BillStatus.OPEN);
            when(billValidation.validateBill(bill.getId(), BillAction.CANCEL)).thenReturn(bill);

            BillDetailsResponseDTO response = billService.cancelBill(bill.getId());

            assertThat(response).isNotNull();
            assertThat(bill.getStatus()).isEqualTo(BillStatus.CANCELLED);
            verify(billValidation, times(1)).validateBill(bill.getId(), BillAction.CANCEL);
        }
    }

}