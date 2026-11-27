package org.uorderflow.service.productCategory;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductCategoryRepository;
import org.uorderflow.repository.ProductRepository;

@Component
public class ProductCategoryValidation {

    private final ProductCategoryRepository productCategoryRepository;
    private final ProductRepository productRepository;

    public ProductCategoryValidation(ProductCategoryRepository productCategoryRepository,
                                     ProductRepository productRepository) {
        this.productCategoryRepository = productCategoryRepository;
        this.productRepository = productRepository;
    }

    public ProductCategory validateProductCategory(Long id){
        ProductCategory productCategory = productCategoryRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ProductCategory not found with id " + id + "."));

        return productCategory;
    }

    public void validateCategoryDeletion(Long categoryId) {
        if (productRepository.existsByProductCategoryId(categoryId)) {
            throw new BusinessRuleException("Cannot delete a category while there are products linked to it.");
        }
    }
}
