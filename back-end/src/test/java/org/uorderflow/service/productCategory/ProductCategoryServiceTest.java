package org.uorderflow.service.productCategory;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.dto.productCategory.ProductCategoryResponseDTO;
import org.uorderflow.dto.productCategory.ProductCategoryUpdateDTO;
import org.uorderflow.enums.generic.ValidateAction;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductCategoryRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductCategoryServiceTest {

    @InjectMocks
    private ProductCategoryService productCategoryService;

    @Mock
    private ProductCategoryRepository productCategoryRepository;

    @Mock
    private ProductCategoryValidation productCategoryValidation;

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("Should create category successfully when unique name validation passes")
        void shouldCreateCategorySuccessfully() {
            ProductCategoryCreateDTO createDTO = new ProductCategoryCreateDTO("Desserts");
            doNothing().when(productCategoryValidation).validateUniqueFields(createDTO.name());

            ProductCategoryResponseDTO response = productCategoryService.create(createDTO);

            assertThat(response).isNotNull();
            assertThat(response.name()).isEqualTo("Desserts");

            verify(productCategoryValidation, times(1)).validateUniqueFields("Desserts");
            verify(productCategoryRepository, times(1)).save(any(ProductCategory.class));
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should throw AccessDeniedException when non-admin user requests deleted categories")
        void shouldThrowAccessDeniedExceptionWhenNonAdminRequestsDeleted() {
            assertThatThrownBy(() -> productCategoryService.findAll(true, false))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessage("Only users with the ADMIN role can view deleted productCategories.");

            verify(productCategoryRepository, never()).findAllSorted(anyBoolean());
        }

        @Test
        @DisplayName("Should return deleted categories when user is admin")
        void shouldReturnCategoriesWhenAdminRequestsDeleted() {
            ProductCategory productCategory = new ProductCategory(1L, "Appetizers", true);
            when(productCategoryRepository.findAllSorted(true)).thenReturn(List.of(productCategory));

            List<ProductCategoryResponseDTO> response = productCategoryService.findAll(true, true);

            assertThat(response).hasSize(1);
            assertThat(response.get(0).name()).isEqualTo("Appetizers");
            verify(productCategoryRepository, times(1)).findAllSorted(true);
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return category DTO when found by ID")
        void shouldReturnCategoryById() {
            ProductCategory productCategory = new ProductCategory(1L, "Beverages", false);
            when(productCategoryValidation.validateProductCategory(productCategory.getId(), ValidateAction.ACTIVE_CHECK)).thenReturn(productCategory);

            ProductCategoryResponseDTO response = productCategoryService.findById(productCategory.getId());

            assertThat(response).isNotNull();
            assertThat(response.name()).isEqualTo("Beverages");
            verify(productCategoryValidation, times(1)).validateProductCategory(productCategory.getId(), ValidateAction.ACTIVE_CHECK);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("Should validate unique fields when updating to a new category name")
        void shouldValidateUniqueFieldsWhenNameChanges() {
            ProductCategory productCategory = new ProductCategory(1L, "Beverages", false);
            ProductCategoryUpdateDTO updateDTO = new ProductCategoryUpdateDTO("Alcoholic Beverages");
            when(productCategoryValidation.validateProductCategory(productCategory.getId(), ValidateAction.ACTIVE_CHECK)).thenReturn(productCategory);
            doNothing().when(productCategoryValidation).validateUniqueFields("Alcoholic Beverages");

            ProductCategoryResponseDTO response = productCategoryService.update(productCategory.getId(), updateDTO);

            assertThat(response.name()).isEqualTo("Alcoholic Beverages");
            verify(productCategoryValidation, times(1)).validateUniqueFields("Alcoholic Beverages");
        }

        @Test
        @DisplayName("Should not validate unique fields when category name remains unchanged")
        void shouldNotValidateUniqueFieldsWhenNameIsUnchanged() {
            ProductCategory productCategory = new ProductCategory(1L, "Beverages", false);
            ProductCategoryUpdateDTO updateDTO = new ProductCategoryUpdateDTO("Beverages");
            when(productCategoryValidation.validateProductCategory(productCategory.getId(), ValidateAction.ACTIVE_CHECK)).thenReturn(productCategory);

            ProductCategoryResponseDTO response = productCategoryService.update(productCategory.getId(), updateDTO);

            assertThat(response.name()).isEqualTo("Beverages");
            verify(productCategoryValidation, never()).validateUniqueFields(anyString());
        }
    }

    @Nested
    @DisplayName("delete & reactivate")
    class LifecycleTests {

        @Test
        @DisplayName("Should call delete method on entity when deleting")
        void shouldDeleteCategory() {
            ProductCategory productCategory = mock(ProductCategory.class);
            when(productCategory.getId()).thenReturn(1L);
            when(productCategoryValidation.validateProductCategory(productCategory.getId(), ValidateAction.DELETE)).thenReturn(productCategory);

            productCategoryService.delete(productCategory.getId());

            verify(productCategory, times(1)).delete();
            verify(productCategoryValidation, times(1)).validateProductCategory(productCategory.getId(), ValidateAction.DELETE);
        }

        @Test
        @DisplayName("Should call reactivate method on entity and return response DTO when reactivating")
        void shouldReactivateCategory() {
            ProductCategory productCategory = mock(ProductCategory.class);
            when(productCategory.getId()).thenReturn(1L);
            when(productCategoryValidation.validateProductCategory(productCategory.getId(), ValidateAction.REACTIVATE)).thenReturn(productCategory);

            ProductCategoryResponseDTO response = productCategoryService.reactivate(productCategory.getId());

            assertThat(response).isNotNull();
            verify(productCategory, times(1)).reactivate();
            verify(productCategoryValidation, times(1)).validateProductCategory(productCategory.getId(), ValidateAction.REACTIVATE);
        }
    }
}