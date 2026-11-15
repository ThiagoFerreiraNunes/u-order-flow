package org.uorderflow.service.product;

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
import org.springframework.security.access.AccessDeniedException;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.product.ProductDetailsResponseDTO;
import org.uorderflow.dto.product.ProductSummaryResponseDTO;
import org.uorderflow.dto.product.ProductUpdateDTO;
import org.uorderflow.enums.generic.ValidateAction;
import org.uorderflow.enums.product.ProductAction;
import org.uorderflow.model.Product;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductRepository;
import org.uorderflow.service.productCategory.ProductCategoryValidation;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @InjectMocks
    private ProductService productService;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductValidation productValidation;

    @Mock
    private ProductCategoryValidation productCategoryValidation;

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("Should create product successfully when category and unique name validations pass")
        void shouldCreateProductSuccessfully() {
            ProductCreateDTO createDTO = new ProductCreateDTO(
                    "Cheeseburger",
                    "Delicious burger",
                    "img.jpg",
                    new BigDecimal("29.90"),
                    1L,
                    true
            );
            ProductCategory productCategory = new ProductCategory(1L, "Burgers", false);
            when(productCategoryValidation.validateProductCategory(productCategory.getId(), ValidateAction.ACTIVE_CHECK)).thenReturn(productCategory);
            doNothing().when(productValidation).validateUniqueFields("Cheeseburger");

            ProductDetailsResponseDTO response = productService.create(createDTO);

            assertThat(response).isNotNull();
            assertThat(response.name()).isEqualTo("Cheeseburger");

            verify(productCategoryValidation, times(1)).validateProductCategory(productCategory.getId(), ValidateAction.ACTIVE_CHECK);
            verify(productValidation, times(1)).validateUniqueFields("Cheeseburger");
            verify(productRepository, times(1)).save(any(Product.class));
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("Should throw AccessDeniedException when non-admin user requests deleted products")
        void shouldThrowAccessDeniedExceptionWhenNonAdminRequestsDeleted() {
            Pageable pageable = PageRequest.of(0, 10);

            assertThatThrownBy(() -> productService.findAll(null, true, pageable, false))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessage("Only users with the ADMIN role can view deleted products.");

            verify(productRepository, never()).findAllPaged(anyBoolean(), any());
            verify(productRepository, never()).findAllPagedByName(anyString(), anyBoolean(), any());
        }

        @Test
        @DisplayName("Should call findAllPagedByName when name filter is provided")
        void shouldCallFindAllPagedByNameWhenNameProvided() {
            Pageable pageable = PageRequest.of(0, 10);
            ProductCategory productCategory = new ProductCategory(1L, "Burgers", false);
            Product product = new Product(1L, "Burger", "Desc", "img.jpg", new BigDecimal("20.00"), true, false, productCategory);
            Page<Product> page = new PageImpl<>(List.of(product));
            when(productRepository.findAllPagedByName("Burger", false, pageable)).thenReturn(page);

            Page<ProductSummaryResponseDTO> response = productService.findAll("Burger", false, pageable, true);

            assertThat(response).hasSize(1);
            assertThat(response.getContent().get(0).name()).isEqualTo("Burger");
            verify(productRepository, times(1)).findAllPagedByName("Burger", false, pageable);
            verify(productRepository, never()).findAllPaged(anyBoolean(), any());
        }

        @Test
        @DisplayName("Should call findAllPaged when name filter is null or blank")
        void shouldCallFindAllPagedWhenNameIsBlank() {
            Pageable pageable = PageRequest.of(0, 10);
            ProductCategory productCategory = new ProductCategory(1L, "Burgers", false);
            Product product = new Product(1L, "Burger", "Desc", "img.jpg", new BigDecimal("20.00"), true, false, productCategory);
            Page<Product> page = new PageImpl<>(List.of(product));
            when(productRepository.findAllPaged(false, pageable)).thenReturn(page);

            Page<ProductSummaryResponseDTO> response = productService.findAll("   ", false, pageable, true);

            assertThat(response).hasSize(1);
            verify(productRepository, times(1)).findAllPaged(false, pageable);
            verify(productRepository, never()).findAllPagedByName(anyString(), anyBoolean(), any());
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("Should return product details DTO when found by ID")
        void shouldReturnProductById() {
            ProductCategory productCategory = new ProductCategory(1L, "Burgers", false);
            Product product = new Product(10L, "Burger", "Desc", "img.jpg", new BigDecimal("20.00"), true, false, productCategory);
            when(productValidation.validateProduct(product.getId(), ProductAction.ACTIVE_CHECK)).thenReturn(product);

            ProductDetailsResponseDTO response = productService.findById(product.getId());

            assertThat(response).isNotNull();
            assertThat(response.name()).isEqualTo("Burger");
            verify(productValidation, times(1)).validateProduct(product.getId(), ProductAction.ACTIVE_CHECK);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("Should validate unique name and category when both are provided and changed")
        void shouldValidateNameAndCategoryWhenBothAreUpdated() {
            ProductCategory oldCategory = new ProductCategory(1L, "Burgers", false);
            ProductCategory newCategory = new ProductCategory(2L, "Drinks", false);
            Product product = new Product(10L, "Old Burger", "Desc", "img.jpg", new BigDecimal("20.00"), true, false, oldCategory);
            ProductUpdateDTO updateDTO = new ProductUpdateDTO("New Soda", "Cool drink", "new.jpg", new BigDecimal("10.00"), 2L, true);
            when(productValidation.validateProduct(product.getId(), ProductAction.ACTIVE_CHECK)).thenReturn(product);
            doNothing().when(productValidation).validateUniqueFields("New Soda");
            when(productCategoryValidation.validateProductCategory(2L, ValidateAction.ACTIVE_CHECK)).thenReturn(newCategory);

            ProductDetailsResponseDTO response = productService.update(product.getId(), updateDTO);

            assertThat(response.name()).isEqualTo("New Soda");
            assertThat(response.productCategory().name()).isEqualTo("Drinks");
            verify(productValidation, times(1)).validateUniqueFields("New Soda");
            verify(productCategoryValidation, times(1)).validateProductCategory(2L, ValidateAction.ACTIVE_CHECK);
        }

        @Test
        @DisplayName("Should not validate unique name or category when name is unchanged and categoryId is null")
        void shouldNotValidateWhenNameUnchangedAndCategoryNull() {
            ProductCategory productCategory = new ProductCategory(1L, "Burgers", false);
            Product product = new Product(10L, "Burger", "Desc", "img.jpg", new BigDecimal("20.00"), true, false, productCategory);
            ProductUpdateDTO updateDTO = new ProductUpdateDTO("Burger", "Updated Desc", null, new BigDecimal("25.00"), null, true);
            when(productValidation.validateProduct(product.getId(), ProductAction.ACTIVE_CHECK)).thenReturn(product);

            ProductDetailsResponseDTO response = productService.update(product.getId(), updateDTO);

            assertThat(response.name()).isEqualTo("Burger");
            verify(productValidation, never()).validateUniqueFields(anyString());
            verify(productCategoryValidation, never()).validateProductCategory(anyLong(), any());
        }
    }

    @Nested
    @DisplayName("delete & reactivate")
    class LifecycleTests {

        @Test
        @DisplayName("Should call delete method on entity when deleting")
        void shouldDeleteProduct() {
            Product product = mock(Product.class);
            when(product.getId()).thenReturn(1L);
            when(productValidation.validateProduct(product.getId(), ProductAction.DELETE)).thenReturn(product);

            productService.delete(product.getId());

            verify(product, times(1)).delete();
            verify(productValidation, times(1)).validateProduct(product.getId(), ProductAction.DELETE);
        }

        @Test
        @DisplayName("Should call reactivate method on entity and return response DTO when reactivating")
        void shouldReactivateProduct() {
            Product product = mock(Product.class);
            when(product.getId()).thenReturn(1L);
            when(productValidation.validateProduct(product.getId(), ProductAction.REACTIVATE)).thenReturn(product);

            ProductDetailsResponseDTO response = productService.reactivate(product.getId());

            assertThat(response).isNotNull();
            verify(product, times(1)).reactivate();
            verify(productValidation, times(1)).validateProduct(product.getId(), ProductAction.REACTIVATE);
        }
    }
}