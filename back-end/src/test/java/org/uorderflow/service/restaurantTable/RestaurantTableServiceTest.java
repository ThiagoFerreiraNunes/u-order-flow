package org.uorderflow.service.restaurantTable;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.uorderflow.dto.restaurantTable.RestaurantTableCreateDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableResponseDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableUpdateDTO;
import org.uorderflow.enums.generic.ValidateAction;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.RestaurantTableRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RestaurantTableServiceTest {

    @InjectMocks
    private RestaurantTableService restaurantTableService;

    @Mock
    private RestaurantTableRepository restaurantTableRepository;

    @Mock
    private RestaurantTableValidation restaurantTableValidation;

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("Should create table successfully when validation passes")
        void shouldCreateTableSuccessfully() {
            RestaurantTableCreateDTO createDTO = new RestaurantTableCreateDTO(5);
            doNothing().when(restaurantTableValidation).validateUniqueFields(createDTO.number());

            RestaurantTableResponseDTO response = restaurantTableService.create(createDTO);

            assertThat(response).isNotNull();
            assertThat(response.number()).isEqualTo(5);
            verify(restaurantTableValidation, times(1)).validateUniqueFields(createDTO.number());
            verify(restaurantTableRepository, times(1)).save(any(RestaurantTable.class));
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should throw AccessDeniedException when isDeleted is true and user is not Admin")
        void shouldThrowAccessDeniedExceptionWhenNonAdminRequestsDeleted() {
            assertThatThrownBy(() -> restaurantTableService.findAll(true, false))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessage("Only users with the ADMIN role can view deleted restaurantTables.");

            verify(restaurantTableRepository, never()).findAllSorted(anyBoolean());
        }

        @Test
        @DisplayName("Should return tables when isDeleted is true and user is Admin")
        void shouldReturnTablesWhenAdminRequestsDeleted() {
            RestaurantTable restaurantTable = new RestaurantTable(1L, 1, true);
            when(restaurantTableRepository.findAllSorted(true)).thenReturn(List.of(restaurantTable));

            List<RestaurantTableResponseDTO> response = restaurantTableService.findAll(true, true);

            assertThat(response).hasSize(1);
            assertThat(response.get(0).number()).isEqualTo(1);
            verify(restaurantTableRepository, times(1)).findAllSorted(true);
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return table DTO when table exists and is active")
        void shouldReturnTableWhenFound() {
            RestaurantTable restaurantTable = new RestaurantTable(1L, 10, false);
            when(restaurantTableValidation.validateRestaurantTable(restaurantTable.getId(), ValidateAction.ACTIVE_CHECK)).thenReturn(restaurantTable);

            RestaurantTableResponseDTO response = restaurantTableService.findById(restaurantTable.getId());

            assertThat(response).isNotNull();
            assertThat(response.number()).isEqualTo(10);
            verify(restaurantTableValidation, times(1)).validateRestaurantTable(restaurantTable.getId(), ValidateAction.ACTIVE_CHECK);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("Should validate unique fields when table number is updated to a new number")
        void shouldValidateUniqueFieldsWhenNumberChanges() {
            RestaurantTable restaurantTable = new RestaurantTable(1L, 10, false);
            RestaurantTableUpdateDTO updateDTO = new RestaurantTableUpdateDTO(20);
            when(restaurantTableValidation.validateRestaurantTable(restaurantTable.getId(), ValidateAction.ACTIVE_CHECK)).thenReturn(restaurantTable);
            doNothing().when(restaurantTableValidation).validateUniqueFields(20);

            RestaurantTableResponseDTO response = restaurantTableService.update(restaurantTable.getId(), updateDTO);

            assertThat(response.number()).isEqualTo(20);
            verify(restaurantTableValidation, times(1)).validateRestaurantTable(restaurantTable.getId(), ValidateAction.ACTIVE_CHECK);
            verify(restaurantTableValidation, times(1)).validateUniqueFields(20);
        }

        @Test
        @DisplayName("Should not validate unique fields when table number remains the same")
        void shouldNotValidateUniqueFieldsWhenNumberIsSame() {
            RestaurantTable restaurantTable = new RestaurantTable(1L, 10, false);
            RestaurantTableUpdateDTO updateDTO = new RestaurantTableUpdateDTO(10);
            when(restaurantTableValidation.validateRestaurantTable(restaurantTable.getId(), ValidateAction.ACTIVE_CHECK)).thenReturn(restaurantTable);

            RestaurantTableResponseDTO response = restaurantTableService.update(restaurantTable.getId(), updateDTO);

            assertThat(response.number()).isEqualTo(10);
            verify(restaurantTableValidation, times(1)).validateRestaurantTable(restaurantTable.getId(), ValidateAction.ACTIVE_CHECK);
            verify(restaurantTableValidation, never()).validateUniqueFields(anyInt());
        }
    }

    @Nested
    @DisplayName("delete & reactivate")
    class LifecycleTests {

        @Test
        @DisplayName("Should call delete on entity")
        void shouldDeleteTable() {
            RestaurantTable restaurantTable = mock(RestaurantTable.class);
            when(restaurantTable.getId()).thenReturn(1L);
            when(restaurantTableValidation.validateRestaurantTable(restaurantTable.getId(), ValidateAction.DELETE)).thenReturn(restaurantTable);

            restaurantTableService.delete(restaurantTable.getId());

            verify(restaurantTable, times(1)).delete();
            verify(restaurantTableValidation, times(1)).validateRestaurantTable(restaurantTable.getId(), ValidateAction.DELETE);
        }

        @Test
        @DisplayName("Should call reactivate on entity and return response DTO")
        void shouldReactivateTable() {
            RestaurantTable restaurantTable = mock(RestaurantTable.class);
            when(restaurantTable.getId()).thenReturn(1L);
            when(restaurantTableValidation.validateRestaurantTable(restaurantTable.getId(), ValidateAction.REACTIVATE)).thenReturn(restaurantTable);

            RestaurantTableResponseDTO response = restaurantTableService.reactivate(restaurantTable.getId());

            assertThat(response).isNotNull();
            verify(restaurantTable, times(1)).reactivate();
            verify(restaurantTableValidation, times(1)).validateRestaurantTable(restaurantTable.getId(), ValidateAction.REACTIVATE);
        }
    }
}