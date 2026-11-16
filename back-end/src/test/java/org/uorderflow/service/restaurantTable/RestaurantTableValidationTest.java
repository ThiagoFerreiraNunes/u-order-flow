package org.uorderflow.service.restaurantTable;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.uorderflow.enums.generic.ValidateAction;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.RestaurantTableRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RestaurantTableValidationTest {

    @InjectMocks
    private RestaurantTableValidation restaurantTableValidation;

    @Mock
    private RestaurantTableRepository restaurantTableRepository;

    @Nested
    @DisplayName("validateRestaurantTable")
    class ValidateRestaurantTableTests {

        @Test
        @DisplayName("Should return entity when table exists and action is valid")
        void shouldReturnEntityWhenTableExistsAndValid() {
            RestaurantTable restaurantTable = new RestaurantTable(1L, 10, false);
            when(restaurantTableRepository.findById(restaurantTable.getId())).thenReturn(Optional.of(restaurantTable));

            RestaurantTable response = restaurantTableValidation.validateRestaurantTable(restaurantTable.getId(), ValidateAction.ACTIVE_CHECK);

            assertThat(response).isNotNull();
            assertThat(response.getNumber()).isEqualTo(10);
            verify(restaurantTableRepository, times(1)).findById(restaurantTable.getId());
        }

        @Test
        @DisplayName("Should throw EntityNotFoundException when ID does not exist")
        void shouldThrowExceptionWhenIdNotFound() {
            when(restaurantTableRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> restaurantTableValidation.validateRestaurantTable(99L, ValidateAction.ACTIVE_CHECK))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessage("RestaurantTable not found with id 99.");
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when table is deleted and action is ACTIVE_CHECK")
        void shouldThrowExceptionWhenTableIsDeletedOnActiveCheck() {
            RestaurantTable restaurantTable = new RestaurantTable(1L, 10, true);
            when(restaurantTableRepository.findById(restaurantTable.getId())).thenReturn(Optional.of(restaurantTable));

            assertThatThrownBy(() -> restaurantTableValidation.validateRestaurantTable(restaurantTable.getId(), ValidateAction.ACTIVE_CHECK))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("RestaurantTable is deleted with id 1.");
        }
    }

    @Nested
    @DisplayName("validateUniqueFields")
    class ValidateUniqueFieldsTests {

        @Test
        @DisplayName("Should throw BusinessRuleException when table number already exists")
        void shouldThrowExceptionWhenNumberAlreadyExists() {
            when(restaurantTableRepository.existsByNumber(10)).thenReturn(true);

            assertThatThrownBy(() -> restaurantTableValidation.validateUniqueFields(10))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("A RestaurantTable with the number '10' already exists");
        }

        @Test
        @DisplayName("Should not throw exception when table number is unique")
        void shouldNotThrowExceptionWhenNumberIsUnique() {
            when(restaurantTableRepository.existsByNumber(10)).thenReturn(false);

            assertThatCode(() -> restaurantTableValidation.validateUniqueFields(10))
                    .doesNotThrowAnyException();
        }
    }
}