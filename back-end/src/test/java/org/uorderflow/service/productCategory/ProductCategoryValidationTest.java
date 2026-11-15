package org.uorderflow.service.productCategory;

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
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductCategoryRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductCategoryValidationTest {

    @InjectMocks
    private ProductCategoryValidation productCategoryValidation;

    @Mock
    private ProductCategoryRepository productCategoryRepository;

    @Nested
    @DisplayName("validateProductCategory")
    class ValidateProductCategoryTests {

        @Test
        @DisplayName("Should return entity when category exists and action is valid")
        void shouldReturnEntityWhenCategoryExistsAndValid() {
            ProductCategory productCategory = new ProductCategory(1L, "Beverages", false);
            when(productCategoryRepository.findById(productCategory.getId())).thenReturn(Optional.of(productCategory));

            ProductCategory response = productCategoryValidation.validateProductCategory(productCategory.getId(), ValidateAction.ACTIVE_CHECK);

            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo("Beverages");
            verify(productCategoryRepository, times(1)).findById(productCategory.getId());
        }

        @Test
        @DisplayName("Should throw EntityNotFoundException when ID is not found")
        void shouldThrowExceptionWhenIdNotFound() {
            when(productCategoryRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> productCategoryValidation.validateProductCategory(99L, ValidateAction.ACTIVE_CHECK))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessage("ProductCategory not found with id 99.");
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when category is deleted on ACTIVE_CHECK action")
        void shouldThrowExceptionWhenCategoryIsDeletedOnActiveCheck() {
            ProductCategory productCategory = new ProductCategory(1L, "Beverages", true);
            when(productCategoryRepository.findById(productCategory.getId())).thenReturn(Optional.of(productCategory));

            assertThatThrownBy(() -> productCategoryValidation.validateProductCategory(productCategory.getId(), ValidateAction.ACTIVE_CHECK))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("ProductCategory is deleted with id 1.");
        }
    }

    @Nested
    @DisplayName("validateUniqueFields")
    class ValidateUniqueFieldsTests {

        @Test
        @DisplayName("Should throw BusinessRuleException when category name already exists")
        void shouldThrowExceptionWhenNameAlreadyExists() {
            when(productCategoryRepository.existsByName("Desserts")).thenReturn(true);

            assertThatThrownBy(() -> productCategoryValidation.validateUniqueFields("Desserts"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("A ProductCategory with the name 'Desserts' already exists");
        }

        @Test
        @DisplayName("Should not throw exception when category name is unique")
        void shouldNotThrowExceptionWhenNameIsUnique() {
            when(productCategoryRepository.existsByName("Beverages")).thenReturn(false);

            assertThatCode(() -> productCategoryValidation.validateUniqueFields("Beverages"))
                    .doesNotThrowAnyException();
        }
    }
}