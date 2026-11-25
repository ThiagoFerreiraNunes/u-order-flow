package org.uorderflow.repository;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.model.ProductCategory;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;


@DataJpaTest
@ActiveProfiles("test")
class ProductCategoryRepositoryTest {

    @Autowired private EntityManager entityManager;
    @Autowired private ProductCategoryRepository productCategoryRepository;

    @Test
    @DisplayName("Should return a sorted list of all active (non-deleted) product categories")
    void shouldFindAllByIsDeletedFalse() {
        setupMockProductCategories();
        List<ProductCategory> result = productCategoryRepository.findAllSorted(false);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should return a sorted list of all deleted product categories")
    void shouldFindAllByIsDeletedTrue() {
        setupMockProductCategories();
        List<ProductCategory> result = productCategoryRepository.findAllSorted(true);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return an empty list when there are no active product categories in the database")
    void shoulNotFindAllByIsDeletedFalse() {
        List<ProductCategory> result = productCategoryRepository.findAllSorted(false);

        assertThat(result).isEmpty();
    }

    private void setupMockProductCategories() {
        ProductCategory p1 = new ProductCategory(new ProductCategoryCreateDTO("Beverages"));
        ProductCategory p2 = new ProductCategory(new ProductCategoryCreateDTO("Classic Burgers"));
        ProductCategory p3 = new ProductCategory(new ProductCategoryCreateDTO("Craft Burgers"));
        ProductCategory p4 = new ProductCategory(new ProductCategoryCreateDTO("Appetizers"));
        p4.delete();
        ProductCategory p5 = new ProductCategory(new ProductCategoryCreateDTO("Combos"));
        ProductCategory p6 = new ProductCategory(new ProductCategoryCreateDTO("Desserts"));

        entityManager.persist(p1);
        entityManager.persist(p2);
        entityManager.persist(p3);
        entityManager.persist(p4);
        entityManager.persist(p5);
        entityManager.persist(p6);

    }

}