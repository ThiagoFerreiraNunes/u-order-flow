package org.uorderflow.service.productCategory;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductCategoryRepository;

@Component
public class ProductCategoryValidation {

    private final ProductCategoryRepository productCategoryRepository;

    public ProductCategoryValidation(ProductCategoryRepository productCategoryRepository) {
        this.productCategoryRepository = productCategoryRepository;
    }

    public ProductCategory validateProductCategory(Long id){
        ProductCategory productCategory = productCategoryRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ProductCategory not found with id " + id + "."));

        return productCategory;
    }
}
