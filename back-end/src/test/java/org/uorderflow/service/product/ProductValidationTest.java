package org.uorderflow.service.product;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.uorderflow.enums.product.ProductAction;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.Product;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductValidationTest {
    @InjectMocks
    private ProductValidation productValidation;

    @Mock
    private ProductRepository productRepository;

    @Nested
    @DisplayName("validateProduct")
    class ValidateProductTests {

        @Test
        @DisplayName("Should return entity when product exists and action is valid")
        void shouldReturnEntityWhenProductExistsAndValid() {
            ProductCategory productCategory = new ProductCategory(1L, "Burgers", false);
            Product product = new Product(10L, "Burger", "Desc", "img.jpg", new BigDecimal("20.00"), true, false, productCategory);
            when(productRepository.findByIdWithDetails(product.getId())).thenReturn(Optional.of(product));

            Product response = productValidation.validateProduct(product.getId(), ProductAction.ACTIVE_CHECK);

            assertThat(response).isNotNull();
            verify(productRepository, times(1)).findByIdWithDetails(product.getId());
        }

        @Test
        @DisplayName("Should throw EntityNotFoundException when product ID is not found")
        void shouldThrowExceptionWhenIdNotFound() {
            when(productRepository.findByIdWithDetails(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> productValidation.validateProduct(99L, ProductAction.ACTIVE_CHECK))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessage("Product not found with id 99.");
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when product is deleted on ACTIVE_CHECK action")
        void shouldThrowExceptionWhenProductIsDeletedOnActiveCheck() {
            ProductCategory productCategory = new ProductCategory(1L, "Burgers", false);
            Product product = new Product(10L, "Burger", "Desc", "img.jpg", new BigDecimal("20.00"), true, true, productCategory);
            when(productRepository.findByIdWithDetails(product.getId())).thenReturn(Optional.of(product));

            assertThatThrownBy(() -> productValidation.validateProduct(product.getId(), ProductAction.ACTIVE_CHECK))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("Product is deleted with id 10.");
        }

        @Test
        @DisplayName("Should throw BusinessRuleException when product is not available on CREATE_ORDER_PRODUCT action")
        void shouldThrowExceptionWhenProductIsNotAvailableOnCreateOrderProduct() {
            ProductCategory productCategory = new ProductCategory(1L, "Burgers", false);
            Product product = new Product(10L, "Burger", "Desc", "img.jpg", new BigDecimal("20.00"), false, false, productCategory);
            when(productRepository.findByIdWithDetails(product.getId())).thenReturn(Optional.of(product));

            assertThatThrownBy(() -> productValidation.validateProduct(product.getId(), ProductAction.CREATE_ORDER_PRODUCT))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("Product is not available with id 10.");
        }
    }

    @Nested
    @DisplayName("validateUniqueFields")
    class ValidateUniqueFieldsTests {

        @Test
        @DisplayName("Should throw BusinessRuleException when product name already exists")
        void shouldThrowExceptionWhenNameAlreadyExists() {
            when(productRepository.existsByName("Cheeseburger")).thenReturn(true);

            assertThatThrownBy(() -> productValidation.validateUniqueFields("Cheeseburger"))
                    .isInstanceOf(BusinessRuleException.class)
                    .hasMessage("A Product with the name 'Cheeseburger' already exists");
        }

        @Test
        @DisplayName("Should not throw exception when product name is unique")
        void shouldNotThrowExceptionWhenNameIsUnique() {
            when(productRepository.existsByName("Cheeseburger")).thenReturn(false);

            assertThatCode(() -> productValidation.validateUniqueFields("Cheeseburger"))
                    .doesNotThrowAnyException();
        }
    }
}