package org.uorderflow.repository;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.model.Product;
import org.uorderflow.model.ProductCategory;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ProductRepositoryTest {

    @Autowired private EntityManager entityManager;
    @Autowired private ProductRepository productRepository;

    @Test
    @DisplayName("Should return a page of active products filtered by name")
    void shouldFindAllPagedByNameAndIsDeletedFalse() {
        setupMockProducts();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findAllPagedByName("Coca" ,false, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getProductCategory().getName()).isEqualTo("Beverages");
    }

    @Test
    @DisplayName("Should return a page of deleted products filtered by name")
    void shouldFindAllPagedByNameAndIsDeletedTrue() {
        setupMockProducts();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findAllPagedByName("Gua" ,true, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getProductCategory().getName()).isEqualTo("Beverages");
    }

    @Test
    @DisplayName("Should return an empty page when searching by a non-existent product name")
    void shouldNotFindPagedByName() {
        setupMockProducts();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findAllPagedByName("Pep" ,false, pageable);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return a page with all active (non-deleted) products")
    void ShouldFindAllPagedByIsDeletedFalse() {
        setupMockProducts();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findAllPaged(false, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getProductCategory().getName()).isEqualTo("Beverages");
    }

    @Test
    @DisplayName("Should return a page with all deleted products")
    void ShouldFindAllPagedByIsDeletedTrue() {
        setupMockProducts();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> result = productRepository.findAllPaged(true, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getProductCategory().getName()).isEqualTo("Beverages");
    }

    @Test
    @DisplayName("Should return a product with its category details when fetching by a valid ID")
    void shouldFindByIdWithDetails() {
        ProductCategory productCategory = createProductCategory("Beverages");

        ProductCreateDTO productDTO = new ProductCreateDTO(
                "Coca-Cola 350ml",
                "Lata de 350ml",
                "img",
                new BigDecimal("5.00"),
                productCategory.getId(),
                true
        );

        Product product = new Product(productDTO, productCategory);
        entityManager.persist(product);

        Optional<Product> result = productRepository.findByIdWithDetails(product.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getProductCategory().getName()).isEqualTo("Beverages");
    }

    @Test
    @DisplayName("Should return an empty Optional when fetching by a non-existent product ID")
    void shouldNotFindByIdWhenItDoesNotExist() {
        Optional<Product> result = productRepository.findByIdWithDetails(999L);
        assertThat(result).isEmpty();
    }

    private ProductCategory createProductCategory(String name) {
        ProductCategory productCategory = new ProductCategory(new ProductCategoryCreateDTO(name));
        entityManager.persist(productCategory);
        return productCategory;
    }

    private void setupMockProducts() {
        ProductCategory productCategory = createProductCategory("Beverages");

        Product p1 = new Product(new ProductCreateDTO(
                "Coca-Cola 350ml",
                "350ml can",
                "img",
                new BigDecimal("5.00"),
                productCategory.getId(),
                true),
                productCategory
        );
        Product p2 = new Product(new ProductCreateDTO(
                "Coca-Cola 2L",
                "Bottle",
                "img",
                new BigDecimal("12.00"),
                productCategory.getId(),
                true),
                productCategory
        );

        Product p3 = new Product(new ProductCreateDTO(
                "Guaraná",
                "350ml can",
                "img",
                new BigDecimal("4.50"),
                productCategory.getId(),
                true),
                productCategory
        );
        p3.delete();

        entityManager.persist(p1);
        entityManager.persist(p2);
        entityManager.persist(p3);
    }
}