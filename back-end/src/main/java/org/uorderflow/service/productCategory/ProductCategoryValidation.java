package org.uorderflow.service.productCategory;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.infra.exception.BusinessRuleException;
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

        if(Boolean.TRUE.equals(productCategory.getIsDeleted())){
            throw new BusinessRuleException("ProductCategory is deleted with id " + id + ".");
        }

        return productCategory;
    }

    public void validateUniqueFields(String name){
        if(productCategoryRepository.existsByName(name)){
            throw new BusinessRuleException("A ProductCategory with the name '" + name + "' already exists");
        }
    }
}
